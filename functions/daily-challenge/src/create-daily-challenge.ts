import { DOCUMENTS_STATUS, METADATA_DOCS, TABLES } from "@repo/common"
import { collectionGroupRefs, refs, subRefs } from "@repo/providers/db-refs"
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

export const createDailyChallenge = async (date?: Date) => {
  const targetDate = date ? formatDate(date) : getTargetDate()

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

  const mapId = pickedData.mapId || null
  let mapImage = null
  let mapWidth = null
  let mapHeight = null
  let maxDistancePoints = null

  if (mapId) {
    const mapSnapshot = await subRefs[TABLES.MAPS](gameId).doc(mapId).get()
    const mapData = mapSnapshot.data()

    if (mapData) {
      mapImage = mapData.imageUrl || null
      mapWidth = mapData.width || null
      mapHeight = mapData.height || null
      maxDistancePoints = mapData.maxDistancePoints ?? null
    }
  }

  const challenge: DailyChallengeDoc = {
    date: targetDate,
    isSpherical,
    gameId,
    gameTitle: gameData.title,
    gameAlternateNames: gameData.alternateNames || null,
    gameThumbnailUrl: gameData.image || null,
    sphericalId: isSpherical ? picked.doc.id : null,
    sphericalImageUrl: isSpherical ? pickedData.image : null,
    flatId: !isSpherical ? picked.doc.id : null,
    flatImageUrl: !isSpherical ? pickedData.image : null,
    mapId,
    mapImage,
    mapPosition: pickedData.mapPosition || null,
    mapWidth,
    mapHeight,
    maxDistancePoints,
    difficulty: pickedData.difficulty || "easy",
  }

  await refs[TABLES.DAILY_CHALLENGES].doc(targetDate).set(challenge)

  logger.info(`[daily-challenge] Created challenge for ${targetDate}: ${gameData.title} (${picked.type}, image: ${picked.doc.id})`)

  return { ...challenge, id: targetDate }
}
