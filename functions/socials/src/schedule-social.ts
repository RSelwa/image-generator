import { DEFAULT_DURATION_SECONDS, DOCUMENTS_STATUS, SOCIALS_HOOKS, SOCIALS_STATUS, TABLES } from "@repo/common"
import { collectionGroupRefs, refs } from "@repo/providers/db-refs"
import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const hookValues = Object.values(SOCIALS_HOOKS)

const getRandomHook = () => {
  const hook = hookValues[Math.floor(Math.random() * hookValues.length)]

  if (!hook) return ""

  return hook
}

const getUnusedSpherical = async () => {
  const [sphericalsSnapshot, socialsSnapshot] = await Promise.all([
    collectionGroupRefs[TABLES.SPHERICAL]
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .get(),
    refs[TABLES.SOCIALS].get(),
  ])

  const usedSphericalIds = new Set(
    socialsSnapshot.docs.map((doc) => doc.data().sphericalId).filter(Boolean),
  )

  const unusedSphericals = sphericalsSnapshot.docs.filter(
    (doc) => !usedSphericalIds.has(doc.id),
  )

  if (unusedSphericals.length === 0) {
    return null
  }

  return unusedSphericals[Math.floor(Math.random() * unusedSphericals.length)]
}

export const createScheduledSocial = async () => {
  const sphericalDoc = await getUnusedSpherical()

  if (!sphericalDoc) {
    logger.warn("No unused READY spherical found — skipping social creation")

    return
  }

  const sphericalPath = sphericalDoc.ref.path
  const gameId = sphericalPath.split("/")[1]

  if (!gameId) {
    logger.error(`Could not extract gameId from path: ${sphericalPath}`)

    return
  }

  const hook = getRandomHook()

  await refs[TABLES.SOCIALS].add({
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    gameId,
    sphericalId: sphericalDoc.id,
    hook,
    status: SOCIALS_STATUS.WAITING_CAPTURE,
    duration: DEFAULT_DURATION_SECONDS,
    errorInfo: null,
    urlSphericalVideoStorage: null,
    urlCustomizedVideoStorage: null,
    urlTikTok: null,
    tiktokViews: null,
    tiktokLikes: null,
    urlInstagram: null,
    instagramViews: null,
    instagramLikes: null,
  })

  logger.info(`Created social doc for spherical ${sphericalDoc.id} (game: ${gameId}) with hook: "${hook}"`)
}
