import { TABLES } from "@repo/common"
import { type CardDoc, type CardPoolDoc, type CardRarity } from "@repo/schemas"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const getCardPoolRef = (rarity: CardRarity) =>
  getFirestore().doc(
    `${TABLES.CARD_POOLS}/${rarity}`,
  ) as FirebaseFirestore.DocumentReference<CardPoolDoc>

export const updateCardPools = async (
  cardId: string,
  before: CardDoc | undefined,
  after: CardDoc | undefined,
) => {
  const beforeRarity = before?.cardProperties.rarity
  const afterRarity = after?.cardProperties.rarity

  const isPoolEntryUnchanged =
    beforeRarity === afterRarity && before?.gameId === after?.gameId

  if (isPoolEntryUnchanged) return

  const batch = getFirestore().batch()

  if (before) {
    batch.set(
      getCardPoolRef(before.cardProperties.rarity),
      { cards: FieldValue.arrayRemove({ cardId, gameId: before.gameId }) },
      { merge: true },
    )
  }

  if (after) {
    batch.set(
      getCardPoolRef(after.cardProperties.rarity),
      { cards: FieldValue.arrayUnion({ cardId, gameId: after.gameId }) },
      { merge: true },
    )
  }

  await batch.commit()

  logger.info(
    `Moved card ${cardId} between card pools: ${beforeRarity || "none"} → ${afterRarity || "none"}`,
  )
}
