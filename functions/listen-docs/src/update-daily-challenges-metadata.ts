import { METADATA_DOCS, TABLES } from "@repo/common"
import { type DailyChallengeDoc, type DailyChallengeHistoryDoc } from "@repo/schemas"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const getMetadataRef = () =>
  getFirestore().doc(`${TABLES.METADATA}/${METADATA_DOCS.DAILY_CHALLENGE_HISTORY}`) as FirebaseFirestore.DocumentReference<DailyChallengeHistoryDoc>

const getImageId = (doc: DailyChallengeDoc) =>
  doc.isSpherical ? doc.sphericalId : doc.flatId

export const updateDailyChallengesMetadata = async (
  date: string,
  before: DailyChallengeDoc | undefined,
  after: DailyChallengeDoc | undefined,
) => {
  const isCreate = !before && after
  const isDelete = before && !after
  const isUpdate = before && after

  if (isDelete) {
    const imageId = getImageId(before)

    if (!imageId) return

    await getMetadataRef().update({
      [`usedImages.${imageId}`]: FieldValue.delete(),
    })

    logger.info(`Removed image ${imageId} from dailyChallengeHistory metadata`)

    return
  }

  if (isCreate) {
    const imageId = getImageId(after)

    if (!imageId) return

    const metadataDoc = await getMetadataRef().get()

    if (!metadataDoc.exists) {
      await getMetadataRef().set({ usedImages: { [imageId]: date } })
    } else {
      await getMetadataRef().update({
        [`usedImages.${imageId}`]: date,
      })
    }

    logger.info(`Added image ${imageId} (date: ${date}) to dailyChallengeHistory metadata`)

    return
  }

  if (isUpdate) {
    const beforeImageId = getImageId(before)
    const afterImageId = getImageId(after)

    if (beforeImageId === afterImageId) return

    const updates: Record<string, string | FieldValue> = {}

    if (beforeImageId) {
      updates[`usedImages.${beforeImageId}`] = FieldValue.delete()
    }

    if (afterImageId) {
      updates[`usedImages.${afterImageId}`] = date
    }

    await getMetadataRef().update(updates)

    logger.info(`Updated dailyChallengeHistory metadata: ${beforeImageId} → ${afterImageId} (date: ${date})`)
  }
}
