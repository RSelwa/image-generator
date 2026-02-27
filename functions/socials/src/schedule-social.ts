import { DEFAULT_DURATION_SECONDS, DOCUMENTS_STATUS, SOCIALS_HOOKS, SOCIALS_STATUS, TABLES } from "@repo/common"
import { collectionGroupRefs, refs } from "@repo/providers/db-refs"
import { socialDocSchema, type SphericalDoc } from "@repo/schemas"
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

  if (unusedSphericals.length === 0)
    return null

  return unusedSphericals[Math.floor(Math.random() * unusedSphericals.length)]
}

const getAvailableSound = async () => {
  const soundQuery = await refs[TABLES.SOUNDS].where("canBeUsedInPosts", "==", true).limit(1).get()

  return soundQuery.docs[0] || undefined
}

const getSound = async (sphericalDoc: SphericalDoc, gameId: string) => {
  if (sphericalDoc.youtubeLink)
    return {
      youtubeLink: sphericalDoc.youtubeLink
    }

  const gameDoc = await refs[TABLES.GAMES].doc(gameId).get()
  const gameData = gameDoc.data()

  if (gameData?.youtubeLink)
    return {
      youtubeLink: gameData.youtubeLink
    }

  const availableSound = await getAvailableSound()

  if (availableSound?.data().storagePath)
    return {
      soundId: availableSound.id,
      audioLink: availableSound.data().storagePath,
    }

  logger.warn("No sound with storagePath available — social will be created without audio")
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

  const sound = await getSound(sphericalDoc.data(), gameId)

  const hook = getRandomHook()

  const data = socialDocSchema.parse({
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    gameId,
    sphericalId: sphericalDoc.id,
    youtubeLink: sound?.youtubeLink || null,
    audioLink: sound?.audioLink || null,
    soundId: sound?.soundId || null,
    hook,
    status: SOCIALS_STATUS.WAITING_JOB_START,
    duration: DEFAULT_DURATION_SECONDS,
  })

  await refs[TABLES.SOCIALS].add(data)

  logger.info(`Created social doc for spherical ${sphericalDoc.id} (game: ${gameId}) with hook: "${hook}"`)
}
