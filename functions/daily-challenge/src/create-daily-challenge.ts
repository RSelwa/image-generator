import { DOCUMENTS_STATUS, METADATA_DOCS, TABLES } from "@repo/common"
import { collectionGroupRefs, refs } from "@repo/providers/db-refs"
import { type DailyChallengeDoc, type DailyChallengeHistoryDoc } from "@repo/schemas"
import { getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const getHistoryRef = () =>
  getFirestore().doc(`${TABLES.METADATA}/${METADATA_DOCS.DAILY_CHALLENGE_HISTORY}`)

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const getTargetDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  return formatDate(date)
}

export const createDailyChallenge = async () => {
  const targetDate = getTargetDate()

  const existingDoc = await refs[TABLES.DAILY_CHALLENGES].doc(targetDate).get()

  if (existingDoc.exists) {
    logger.info(`[daily-challenge] Challenge already exists for ${targetDate}, skipping`)

    return
  }

  const historySnapshot = await getHistoryRef().get()
  const history = historySnapshot.data() as DailyChallengeHistoryDoc | undefined
  const usedImages = history?.usedImages || {}

  const readySphericals = await collectionGroupRefs[TABLES.SPHERICAL]
    .where("status", "==", DOCUMENTS_STATUS.READY)
    .get()

  const readyFlats = await collectionGroupRefs[TABLES.FLAT]
    .where("status", "==", DOCUMENTS_STATUS.READY)
    .get()

  const availableSphericals = readySphericals.docs.filter((doc) => !usedImages[doc.id])
  const availableFlats = readyFlats.docs.filter((doc) => !usedImages[doc.id])

  const allAvailable = [
    ...availableSphericals.map((doc) => ({ type: "spherical" as const, doc })),
    ...availableFlats.map((doc) => ({ type: "flat" as const, doc })),
  ]

  if (allAvailable.length === 0) {
    logger.warn(`[daily-challenge] No available images for ${targetDate}`)

    return
  }

  const randomIndex = Math.floor(Math.random() * allAvailable.length)
  const picked = allAvailable[randomIndex]

  if (!picked) {
    logger.error(`[daily-challenge] Failed to pick a random image for ${targetDate}`)

    return
  }

  const pickedData = picked.doc.data()
  const gameId = pickedData.gameId

  const gameSnapshot = await refs[TABLES.GAMES].doc(gameId).get()
  const gameData = gameSnapshot.data()

  if (!gameData) {
    logger.error(`[daily-challenge] Game ${gameId} not found`)

    return
  }

  const isSpherical = picked.type === "spherical"

  const challenge: DailyChallengeDoc = {
    date: targetDate,
    isSpherical,
    gameId,
    gameTitle: gameData.title,
    gameAlternateNames: gameData.alternateNames || null,
    sphericalId: isSpherical ? picked.doc.id : null,
    sphericalImageUrl: isSpherical ? pickedData.image : null,
    flatId: !isSpherical ? picked.doc.id : null,
    flatImageUrl: !isSpherical ? pickedData.image : null,
    mapId: pickedData.mapId || null,
    mapImage: null,
    mapPosition: pickedData.mapPosition || null,
    mapWidth: null,
    mapHeight: null,
    maxDistancePoints: null,
    difficulty: pickedData.difficulty || "easy",
  }

  await refs[TABLES.DAILY_CHALLENGES].doc(targetDate).set(challenge)

  logger.info(`[daily-challenge] Created challenge for ${targetDate}: ${gameData.title} (${picked.type}, image: ${picked.doc.id})`)
}
