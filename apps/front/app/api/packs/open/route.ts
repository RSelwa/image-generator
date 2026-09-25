import { CARD_RARITY, consumePack, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { auth, db } from "@repo/providers/firebase"
import {
  type CardPoolEntry,
  type CardRarity,
  cardDocSchema,
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
        cardPoolDocSchema.safeParse(poolSnapshots[index]?.data()).data?.cards ||
          [],
      ]),
    ) as Record<CardRarity, CardPoolEntry[]>

    const picks = drawRarities(Math.random).map((rarity) =>
      pickCard(pools, rarity, Math.random),
    )
    const drawnCards = picks.flatMap((pick) => (pick ? [pick] : []))

    if (drawnCards.length < picks.length) return OPEN_PACK_RESULT.NO_CARD

    const pulls = new Map<string, { entry: CardPoolEntry; count: number }>()
    drawnCards.forEach(({ entry }) => {
      const count = (pulls.get(entry.cardId)?.count || 0) + 1
      pulls.set(entry.cardId, { entry, count })
    })
    const pulledEntries = [...pulls.values()]

    const ownedCardsRef = subRefs[TABLES.CARDS](uid)
    const [cardSnapshots, ownedSnapshots] = await Promise.all([
      transaction.getAll(
        ...pulledEntries.map(({ entry }) =>
          refs[TABLES.CARDS].doc(entry.cardId),
        ),
      ),
      transaction.getAll(
        ...pulledEntries.map(({ entry }) => ownedCardsRef.doc(entry.cardId)),
      ),
    ])

    const cardDocs = cardSnapshots.flatMap((snapshot) => {
      const card = cardDocSchema.safeParse(snapshot.data()).data

      return card ? [{ cardId: snapshot.id, card }] : []
    })
    const mapSnapshots =
      cardDocs.length > 0
        ? await transaction.getAll(
            ...cardDocs.map(({ card }) =>
              subRefs[TABLES.MAPS](card.gameId).doc(card.mapId),
            ),
          )
        : []

    const drawnCardDetails = new Map(
      cardDocs.flatMap(({ cardId, card }, index) => {
        const map = mapDocSchema.safeParse(mapSnapshots[index]?.data()).data

        return map ? [[cardId, { card, map }]] : []
      }),
    )

    const pulledCards = pulledEntries.flatMap((pull) => {
      const details = drawnCardDetails.get(pull.entry.cardId)

      return details ? [{ ...pull, ...details }] : []
    })

    if (pulledCards.length < pulledEntries.length) {
      console.error(
        "Card pool drift, drawn cards or their maps gone:",
        pulledEntries.flatMap(({ entry }) =>
          drawnCardDetails.has(entry.cardId) ? [] : [entry.cardId],
        ),
      )

      return OPEN_PACK_RESULT.NO_CARD
    }

    const ownedCardIds = new Set(
      ownedSnapshots.flatMap((snapshot) =>
        snapshot.exists ? [snapshot.id] : [],
      ),
    )
    const now = FieldValue.serverTimestamp()

    pulledCards.forEach(({ entry, count, card }) => {
      const ownedCardRef = ownedCardsRef.doc(entry.cardId)

      if (ownedCardIds.has(entry.cardId)) {
        transaction.update(ownedCardRef, {
          count: FieldValue.increment(count),
          lastPulledAt: now,
        })

        return
      }

      transaction.create(ownedCardRef, {
        ...entry,
        count,
        cardPropertiesAtPull: card.cardProperties,
        firstPulledAt: now,
        lastPulledAt: now,
      })
    })

    const revealedCardIds = new Set<string>()
    const cards = drawnCards.flatMap(({ entry }) => {
      const details = drawnCardDetails.get(entry.cardId)

      if (!details) return []

      const isNew =
        !ownedCardIds.has(entry.cardId) && !revealedCardIds.has(entry.cardId)
      revealedCardIds.add(entry.cardId)

      return [
        {
          ...entry,
          mapId: details.card.mapId,
          name: details.map.name,
          imageUrl: details.map.imageUrl || null,
          cardProperties: details.card.cardProperties,
          isNew,
        },
      ]
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
