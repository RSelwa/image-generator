import { TABLES } from "@repo/common"
import { type CardPoolDoc, type CardRarity, type MapDoc } from "@repo/schemas"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const getCardPoolRef = (rarity: CardRarity) =>
  getFirestore().doc(
    `${TABLES.CARD_POOLS}/${rarity}`,
  ) as FirebaseFirestore.DocumentReference<CardPoolDoc>

export const updateCardPools = async (
  gameId: string,
  mapId: string,
  before: MapDoc | undefined,
  after: MapDoc | undefined,
) => {
  const beforeRarity = before?.cardProperties?.rarity
  const afterRarity = after?.cardProperties?.rarity

  if (beforeRarity === afterRarity) return

  const entry = { mapId, gameId }
  const batch = getFirestore().batch()

  if (beforeRarity) {
    batch.set(
      getCardPoolRef(beforeRarity),
      { maps: FieldValue.arrayRemove(entry) },
      { merge: true },
    )
  }

  if (afterRarity) {
    batch.set(
      getCardPoolRef(afterRarity),
      { maps: FieldValue.arrayUnion(entry) },
      { merge: true },
    )
  }

  await batch.commit()

  logger.info(
    `Moved map ${mapId} between card pools: ${beforeRarity || "none"} → ${afterRarity || "none"}`,
  )
}
