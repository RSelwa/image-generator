import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type FlatDoc, type SphericalDoc } from "@repo/schemas"
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

  const isOldDocNeedVerification = data.status === DOCUMENTS_STATUS.NEED_VERIFICATION
  const isOldDocReady = data.status === DOCUMENTS_STATUS.READY

  if (isOldDocNeedVerification || isOldDocReady) {
    logger.info(`Spherical ${sphericalId} in game ${gameId} is already in status ${data.status}`)

    return
  }

  const hasSphericalImage = Boolean(data.image && data.image !== "")
  const isSphericalThumbnailReady = Boolean(data.thumbnail && data.thumbnail !== "")
  const isSPhericalMapIdReady = Boolean(data.mapId && data.mapId !== "" && data.mapPosition && data.mapPosition.x !== undefined && data.mapPosition.y !== undefined)

  const isReady = hasSphericalImage && (isSphericalThumbnailReady || isSPhericalMapIdReady)

  if (!isReady) {
    logger.info(`No need to update spherical ${sphericalId} in game ${gameId}`)

    return
  }

  await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).update({ status: DOCUMENTS_STATUS.NEED_VERIFICATION })

  logger.info(`Spherical ${sphericalId} in game ${gameId} status updated to NEED_VERIFICATION`)
}

export const updateFlatStatus = async (
  gameId: string,
  flatId: string,
  data?: FlatDoc,
) => {
  if (!data) {
    logger.warn(`No data for flat ${flatId} in game ${gameId}`)

    return
  }

  const isOldDocNeedVerification = data.status === DOCUMENTS_STATUS.NEED_VERIFICATION
  const isOldDocReady = data.status === DOCUMENTS_STATUS.READY

  if (isOldDocNeedVerification || isOldDocReady) {
    logger.info(`Flat ${flatId} in game ${gameId} is already in status ${data.status}`)

    return
  }

  const hasFlatImage = Boolean(data.image && data.image !== "")
  const isSphericalThumbnailReady = Boolean(data.thumbnail && data.thumbnail !== "")
  const isSPhericalMapIdReady = Boolean(data.thumbnail && data.thumbnail !== "")

  const isReady = hasFlatImage && (isSphericalThumbnailReady || isSPhericalMapIdReady)

  if (!isReady) {
    logger.info(`No need to update flat ${flatId} in game ${gameId}`)

    return
  }

  await subRefs[TABLES.FLAT](gameId).doc(flatId).update({ status: DOCUMENTS_STATUS.NEED_VERIFICATION })

  logger.info(`Flat ${flatId} in game ${gameId} status updated to NEED_VERIFICATION`)
}
