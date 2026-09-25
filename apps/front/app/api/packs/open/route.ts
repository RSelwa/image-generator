import { CARD_RARITY, consumePack, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { auth, db } from "@repo/providers/firebase"
import {
  type CardDocWithId,
  type CardRarity,
  cardDocSchema,
  userDocSchema,
} from "@repo/schemas"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { type OpenPackResponse } from "@/schemas/packs"
import { drawRarities, pickCard } from "@/utils/card-draw"
import { getCardSubject, getCardSubjectRef } from "@/utils/card-subject"

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
    const [user, cardsSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(refs[TABLES.CARDS]),
    ])

    if (!user.exists) return OPEN_PACK_RESULT.USER_NOT_FOUND

    const { packsStored, packsRefillAnchor } = userDocSchema.parse(user.data())
    const consumedStock = consumePack({
      packsStored,
      refillAnchorMs: packsRefillAnchor?.toMillis() || null,
      nowMs: Date.now(),
    })

    if (!consumedStock) return OPEN_PACK_RESULT.NO_PACK

    const allCards = cardsSnapshot.docs.flatMap((snapshot) => {
      const card = cardDocSchema.safeParse(snapshot.data()).data

      return card ? [{ ...card, id: snapshot.id }] : []
    })
    const pools = Object.fromEntries(
      RARITIES.map((rarity) => [
        rarity,
        allCards.filter((card) => card.rarity === rarity),
      ]),
    ) as Record<CardRarity, CardDocWithId[]>

    const picks = drawRarities(Math.random).map((rarity) =>
      pickCard(pools, rarity, Math.random),
    )
    const drawnCards = picks.flatMap((pick) => (pick ? [pick.card] : []))

    if (drawnCards.length < picks.length) return OPEN_PACK_RESULT.NO_CARD

    const pulls = new Map<string, { card: CardDocWithId; count: number }>()
    drawnCards.forEach((card) => {
      const count = (pulls.get(card.id)?.count || 0) + 1
      pulls.set(card.id, { card, count })
    })
    const pulledCards = [...pulls.values()]

    const ownedCardsRef = subRefs[TABLES.CARDS](uid)
    const [ownedSnapshots, subjectSnapshots] = await Promise.all([
      transaction.getAll(
        ...pulledCards.map(({ card }) => ownedCardsRef.doc(card.id)),
      ),
      transaction.getAll(
        ...pulledCards.map(({ card }) => getCardSubjectRef(card)),
      ),
    ])

    const subjects = new Map(
      pulledCards.flatMap(({ card }, index) => {
        const subject = getCardSubject(card, subjectSnapshots[index]?.data())

        return subject ? [[card.id, subject]] : []
      }),
    )

    if (subjects.size < pulledCards.length) {
      console.error(
        "Drawn cards whose map / game is gone:",
        pulledCards.flatMap(({ card }) =>
          subjects.has(card.id) ? [] : [card.id],
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

    pulledCards.forEach(({ card, count }) => {
      const ownedCardRef = ownedCardsRef.doc(card.id)

      if (ownedCardIds.has(card.id)) {
        transaction.update(ownedCardRef, {
          count: FieldValue.increment(count),
          lastPulledAt: now,
        })

        return
      }

      transaction.create(ownedCardRef, {
        cardId: card.id,
        gameId: card.gameId,
        count,
        firstPulledAt: now,
        lastPulledAt: now,
      })
    })

    const revealedCardIds = new Set<string>()
    const cards = drawnCards.flatMap((card) => {
      const subject = subjects.get(card.id)

      if (!subject) return []

      const isNew = !ownedCardIds.has(card.id) && !revealedCardIds.has(card.id)
      revealedCardIds.add(card.id)

      return [
        {
          cardId: card.id,
          gameId: card.gameId,
          rarity: card.rarity,
          number: card.number,
          ...subject,
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
