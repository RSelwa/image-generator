import { CARD_RARITY, consumePack, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { auth, db } from "@repo/providers/firebase"
import {
  type CardPoolEntry,
  type CardRarity,
  cardPoolDocSchema,
  mapDocSchema,
  userDocSchema,
} from "@repo/schemas"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { type OpenPackResponse } from "@/schemas/packs"
import { drawRarities, pickCard } from "@/utils/card-draw"

const BEARER_PREFIX = "Bearer "

const OPEN_PACK_RESULT = {
  USER_NOT_FOUND: "user_not_found",
  NO_PACK: "no_pack",
  NO_CARD: "no_card",
} as const

const RARITIES = Object.values(CARD_RARITY)

const getVerifiedUid = async (request: Request) => {
  const authHeader = request.headers.get("Authorization") || ""

  if (!authHeader.startsWith(BEARER_PREFIX)) return null

  try {
    const { uid } = await auth.verifyIdToken(
      authHeader.slice(BEARER_PREFIX.length),
    )

    return uid
  } catch {
    return null
  }
}

const openPack = (uid: string) =>
  db.runTransaction(async (transaction) => {
    const userRef = refs[TABLES.USERS].doc(uid)
    const [user, poolSnapshots] = await Promise.all([
      transaction.get(userRef),
      transaction.getAll(
        ...RARITIES.map((rarity) => refs[TABLES.CARD_POOLS].doc(rarity)),
      ),
    ])

    if (!user.exists) return OPEN_PACK_RESULT.USER_NOT_FOUND

    const { packsStored, packsRefillAnchor } = userDocSchema.parse(user.data())
    const consumedStock = consumePack({
      packsStored,
      refillAnchorMs: packsRefillAnchor?.toMillis() || null,
      nowMs: Date.now(),
    })

    if (!consumedStock) return OPEN_PACK_RESULT.NO_PACK

    const pools = Object.fromEntries(
      RARITIES.map((rarity, index) => [
        rarity,
        cardPoolDocSchema.safeParse(poolSnapshots[index]?.data()).data?.maps ||
          [],
      ]),
    ) as Record<CardRarity, CardPoolEntry[]>

    const picks = drawRarities(Math.random).map((rarity) =>
      pickCard(pools, rarity, Math.random),
    )
    const drawnCards = picks.flatMap((pick) => (pick ? [pick] : []))

    if (drawnCards.length < picks.length) return OPEN_PACK_RESULT.NO_CARD

    const pulls = new Map<
      string,
      { entry: CardPoolEntry; rarity: CardRarity; count: number }
    >()
    drawnCards.forEach(({ entry, rarity }) => {
      const count = (pulls.get(entry.mapId)?.count || 0) + 1
      pulls.set(entry.mapId, { entry, rarity, count })
    })
    const pulledEntries = [...pulls.values()]

    const cardsRef = subRefs[TABLES.CARDS](uid)
    const [mapSnapshots, ownedSnapshots] = await Promise.all([
      transaction.getAll(
        ...pulledEntries.map(({ entry }) =>
          subRefs[TABLES.MAPS](entry.gameId).doc(entry.mapId),
        ),
      ),
      transaction.getAll(
        ...pulledEntries.map(({ entry }) => cardsRef.doc(entry.mapId)),
      ),
    ])

    const maps = new Map(
      mapSnapshots.map((snapshot) => [
        snapshot.id,
        mapDocSchema.safeParse(snapshot.data()).data,
      ]),
    )
    const ownedMapIds = new Set(
      ownedSnapshots.flatMap((snapshot) =>
        snapshot.exists ? [snapshot.id] : [],
      ),
    )
    const getCardProperties = (mapId: string, rarity: CardRarity) =>
      maps.get(mapId)?.cardProperties || { rarity }

    const now = FieldValue.serverTimestamp()

    pulledEntries.forEach(({ entry, rarity, count }) => {
      const cardRef = cardsRef.doc(entry.mapId)

      if (ownedMapIds.has(entry.mapId)) {
        transaction.update(cardRef, {
          count: FieldValue.increment(count),
          lastPulledAt: now,
        })

        return
      }

      transaction.create(cardRef, {
        ...entry,
        count,
        cardPropertiesAtPull: getCardProperties(entry.mapId, rarity),
        firstPulledAt: now,
        lastPulledAt: now,
      })
    })

    const revealedMapIds = new Set<string>()
    const cards = drawnCards.map(({ entry, rarity }) => {
      const isNew =
        !ownedMapIds.has(entry.mapId) && !revealedMapIds.has(entry.mapId)
      revealedMapIds.add(entry.mapId)

      return {
        ...entry,
        name: maps.get(entry.mapId)?.name || "",
        imageUrl: maps.get(entry.mapId)?.imageUrl || null,
        cardProperties: getCardProperties(entry.mapId, rarity),
        isNew,
      }
    })

    transaction.update(userRef, {
      packsStored: consumedStock.packsStored,
      packsRefillAnchor: Timestamp.fromMillis(consumedStock.refillAnchorMs),
    })

    return {
      cards,
      packsStored: consumedStock.packsStored,
      packsRefillAnchorMs: consumedStock.refillAnchorMs,
    } satisfies OpenPackResponse
  })

export const POST = async (request: Request) => {
  try {
    const uid = await getVerifiedUid(request)

    if (!uid) return new Response("You need to be logged", { status: 401 })

    const result = await openPack(uid)

    if (result === OPEN_PACK_RESULT.USER_NOT_FOUND) {
      return new Response("User not found", { status: 404 })
    }

    if (result === OPEN_PACK_RESULT.NO_PACK) {
      return new Response("No pack available", { status: 409 })
    }

    if (result === OPEN_PACK_RESULT.NO_CARD) {
      return new Response("No card available", { status: 503 })
    }

    return Response.json(result)
  } catch (error) {
    console.error("Error opening a pack:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
