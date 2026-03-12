import { DOCUMENTS_STATUS, METADATA_DOCS, mockedMapImageURL, TABLES } from "@repo/common"
import { collectionGroupRefs, refs, subRefs } from "@repo/providers/db-refs"
import { type DailyChallengeDoc, toDailyChallengeEntity } from "@repo/schemas"
import { flatFactory, gameFactory, mapFactory, sphericalFactory } from "@repo/testing/factory"
import { getFirestore } from "firebase-admin/firestore"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { createDailyChallenge } from "~/create-daily-challenge"

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
  }
})

const getHistoryRef = () =>
  getFirestore().doc(`${TABLES.METADATA}/${METADATA_DOCS.DAILY_CHALLENGE_HISTORY}`)

const getTargetDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const getChallengeData = async (date: string) => {
  const doc = await refs[TABLES.DAILY_CHALLENGES].doc(date).get()

  return doc.data() as DailyChallengeDoc | undefined
}

const cleanupCollection = async (collectionRef: FirebaseFirestore.Query) => {
  const snapshot = await collectionRef.get()
  const batch = getFirestore().batch()
  snapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
}

beforeEach(async () => {
  await getHistoryRef().delete()

  const targetDate = getTargetDate()
  const challengeRef = refs[TABLES.DAILY_CHALLENGES].doc(targetDate)
  const challengeDoc = await challengeRef.get()

  if (challengeDoc.exists) {
    await challengeRef.delete()
  }

  await cleanupCollection(collectionGroupRefs[TABLES.SPHERICAL])
  await cleanupCollection(collectionGroupRefs[TABLES.FLAT])
  await cleanupCollection(collectionGroupRefs[TABLES.MAPS])
})

describe("createDailyChallenge", () => {
  it("should create a challenge with a ready spherical image without map", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    if (!challenge) throw new Error("Challenge should be defined")

    expect(challenge.date).toBe(targetDate)
    expect(challenge.isSpherical).toBe(true)
    expect(challenge.sphericalId).toBe(spherical.id)
    expect(challenge.gameId).toBe(game.id)
    expect(challenge.gameTitle).toBe(game.title)
    expect(challenge.gameThumbnailUrl).toBe(game.image)
    expect(challenge.mapId).toBeNull()

    const entity = toDailyChallengeEntity({ ...challenge, id: targetDate })
    expect(entity).not.toBeNull()
  })

  it("should create a challenge with a ready spherical image with map", async () => {
    const game = gameFactory({})
    const map = mapFactory({ gameId: game.id })
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.READY,
      mapId: map.id,
      mapPosition: { x: 50, y: 50 },
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.MAPS](game.id).doc(map.id).set(map)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    if (!challenge) throw new Error("Challenge should be defined")

    expect(challenge.date).toBe(targetDate)
    expect(challenge.isSpherical).toBe(true)
    expect(challenge.sphericalId).toBe(spherical.id)
    expect(challenge.gameId).toBe(game.id)
    expect(challenge.mapId).toBe(map.id)
    expect(challenge.mapImage).toBe(mockedMapImageURL)

    const entity = toDailyChallengeEntity({ ...challenge, id: targetDate })
    expect(entity).not.toBeNull()
  })

  it("should create a challenge with a ready flat image without map", async () => {
    const game = gameFactory({})
    const flat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    if (!challenge) throw new Error("Challenge should be defined")

    expect(challenge.date).toBe(targetDate)
    expect(challenge.isSpherical).toBe(false)
    expect(challenge.flatId).toBe(flat.id)
    expect(challenge.gameId).toBe(game.id)
    expect(challenge.gameTitle).toBe(game.title)
    expect(challenge.gameThumbnailUrl).toBe(game.image)
    expect(challenge.mapId).toBeNull()

    const entity = toDailyChallengeEntity({ ...challenge, id: targetDate })
    expect(entity).not.toBeNull()
  })

  it("should create a challenge with a ready flat image with map", async () => {
    const game = gameFactory({})
    const map = mapFactory({ gameId: game.id })
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.READY,
      mapId: map.id,
      mapPosition: { x: 50, y: 50 },
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.MAPS](game.id).doc(map.id).set(map)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    if (!challenge) throw new Error("Challenge should be defined")

    expect(challenge.date).toBe(targetDate)
    expect(challenge.isSpherical).toBe(false)
    expect(challenge.flatId).toBe(flat.id)
    expect(challenge.gameId).toBe(game.id)
    expect(challenge.mapId).toBe(map.id)
    expect(challenge.mapImage).toBe(mockedMapImageURL)

    const entity = toDailyChallengeEntity({ ...challenge, id: targetDate })
    expect(entity).not.toBeNull()
  })

  it("should not pick a spherical image that is already in the history", async () => {
    const game = gameFactory({})
    const usedSpherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })
    const freshSpherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(usedSpherical.id).set(usedSpherical)
    await subRefs[TABLES.SPHERICAL](game.id).doc(freshSpherical.id).set(freshSpherical)

    await getHistoryRef().set({ usedImages: { [usedSpherical.id]: "2026-03-01" } })

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeDefined()
    expect(challenge?.sphericalId).toBe(freshSpherical.id)
    expect(challenge?.sphericalId).not.toBe(usedSpherical.id)
    expect(challenge?.gameThumbnailUrl).toBe(game.image)
  })

  it("should not pick a flat image that is already in the history", async () => {
    const game = gameFactory({})
    const usedFlat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })
    const freshFlat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(usedFlat.id).set(usedFlat)
    await subRefs[TABLES.FLAT](game.id).doc(freshFlat.id).set(freshFlat)

    await getHistoryRef().set({ usedImages: { [usedFlat.id]: "2026-03-01" } })

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeDefined()
    expect(challenge?.flatId).toBe(freshFlat.id)
    expect(challenge?.flatId).not.toBe(usedFlat.id)
    expect(challenge?.gameThumbnailUrl).toBe(game.image)
  })

  it("should not pick images that are not ready", async () => {
    const game = gameFactory({})
    const waitingSpherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.WAITING })
    const readySpherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(waitingSpherical.id).set(waitingSpherical)
    await subRefs[TABLES.SPHERICAL](game.id).doc(readySpherical.id).set(readySpherical)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeDefined()
    expect(challenge?.sphericalId).toBe(readySpherical.id)
    expect(challenge?.sphericalId).not.toBe(waitingSpherical.id)
  })

  it("should not create a challenge if one already exists for the target date", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const targetDate = getTargetDate()
    const existingChallenge: DailyChallengeDoc = {
      date: targetDate,
      isSpherical: true,
      gameId: "existing-game",
      gameTitle: "Existing Game",
      gameAlternateNames: null,
      gameThumbnailUrl: "https://example.com/existing-game.jpg",
      sphericalId: "existing-spherical",
      sphericalImageUrl: "https://example.com/existing.jpg",
      flatId: null,
      flatImageUrl: null,
      mapId: null,
      mapImage: null,
      mapPosition: null,
      mapWidth: null,
      mapHeight: null,
      maxDistancePoints: null,
      difficulty: "easy",
    }

    await refs[TABLES.DAILY_CHALLENGES].doc(targetDate).set(existingChallenge)

    await createDailyChallenge()

    const challenge = await getChallengeData(targetDate)

    expect(challenge?.gameId).toBe("existing-game")
    expect(challenge?.sphericalId).toBe("existing-spherical")
  })

  it("should not create a challenge if no ready images exist at all", async () => {
    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeUndefined()
  })

  it("should not create a challenge if no images are available", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    await getHistoryRef().set({ usedImages: { [spherical.id]: "2026-03-01" } })

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeUndefined()
  })

  it("should pick from both spherical and flat images when both are available", async () => {
    const game1 = gameFactory({})
    const game2 = gameFactory({})
    const spherical = sphericalFactory({ gameId: game1.id, status: DOCUMENTS_STATUS.READY })
    const flat = flatFactory({ gameId: game2.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game1.id).set(game1)
    await refs[TABLES.GAMES].doc(game2.id).set(game2)
    await subRefs[TABLES.SPHERICAL](game1.id).doc(spherical.id).set(spherical)
    await subRefs[TABLES.FLAT](game2.id).doc(flat.id).set(flat)

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeDefined()

    const isSphericalPick = challenge?.sphericalId === spherical.id
    const isFlatPick = challenge?.flatId === flat.id

    expect(isSphericalPick || isFlatPick).toBe(true)
  })

  it("should skip all used images and pick the only remaining one", async () => {
    const game = gameFactory({})
    const used1 = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })
    const used2 = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })
    const fresh = sphericalFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(used1.id).set(used1)
    await subRefs[TABLES.FLAT](game.id).doc(used2.id).set(used2)
    await subRefs[TABLES.SPHERICAL](game.id).doc(fresh.id).set(fresh)

    await getHistoryRef().set({
      usedImages: {
        [used1.id]: "2026-03-01",
        [used2.id]: "2026-03-02",
      },
    })

    await createDailyChallenge()

    const targetDate = getTargetDate()
    const challenge = await getChallengeData(targetDate)

    expect(challenge).toBeDefined()
    expect(challenge?.sphericalId).toBe(fresh.id)
  })
})
