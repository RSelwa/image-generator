import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

export const updateGameStatus = async (gameId: string) => {
  // Check if any spherical document in the subcollection has status READY
  const sphericalDocs = await refs[TABLES.GAMES]
    .doc(gameId)
    .collection(TABLES.SPHERICAL)
    .where("status", "==", DOCUMENTS_STATUS.READY)
    .limit(1)
    .get()

  const hasSphericalImagesReady = !sphericalDocs.empty

  const gameDoc = await refs[TABLES.GAMES].doc(gameId).get()

  // Only update if the value changed
  if (gameDoc.data()?.hasSphericalImagesReady === hasSphericalImagesReady)
    return

  await refs[TABLES.GAMES].doc(gameId).update({ hasSphericalImagesReady })
}

export const updateSphericalStatus = async (
  gameId: string,
  sphericalId: string,
  data?: SphericalDoc,
) => {
  if (!data) {
    logger.warn(`No data for spherical ${sphericalId} in game ${gameId}`)

    return
  }

  const currentStatus = data.status || DOCUMENTS_STATUS.WAITING

  const isReady = Boolean(data.image) && data?.mapId && data?.mapPosition?.x !== undefined && data?.mapPosition?.y !== undefined

  const needChanges = ((currentStatus === DOCUMENTS_STATUS.ERROR || currentStatus === DOCUMENTS_STATUS.WAITING) && isReady)

  if (!needChanges) {
    logger.info(`No need to update spherical ${sphericalId} in game ${gameId}`)

    logger.info(currentStatus, isReady, data, needChanges)

    return
  }

  await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).update({ status: DOCUMENTS_STATUS.NEED_VERIFICATION })

  logger.info(`Spherical ${sphericalId} in game ${gameId} status updated to NEED_VERIFICATION`)
}
