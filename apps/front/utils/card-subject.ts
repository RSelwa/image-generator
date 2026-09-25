import { CARD_TYPE, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardDoc, gameDocSchema, mapDocSchema } from "@repo/schemas"
import { type DocumentReference } from "firebase-admin/firestore"

export const getCardSubjectRef = (card: CardDoc): DocumentReference => {
  if (card.type === CARD_TYPE.GAME) return refs[TABLES.GAMES].doc(card.gameId)

  return subRefs[TABLES.MAPS](card.gameId).doc(card.mapId)
}

export const getCardSubject = (card: CardDoc, subjectData: unknown) => {
  if (card.type === CARD_TYPE.GAME) {
    const game = gameDocSchema.safeParse(subjectData).data

    return game && { name: game.title, imageUrl: game.image || null }
  }

  const map = mapDocSchema.safeParse(subjectData).data

  return map && { name: map.name, imageUrl: map.imageUrl || null }
}
