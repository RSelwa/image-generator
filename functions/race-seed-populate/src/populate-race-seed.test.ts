import { METADATA_DOCS, mockedSphericalImageURL, RACE_SEED_EXTENSION_THRESHOLD, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type DecodedIdToken } from "@repo/providers/firebase"
import { type MarathonSeedDoc, type MarathonSeedDocWithId, type ReadyImagesDoc } from "@repo/schemas"
import { gameFactory, marathonSeedFactory, sphericalFactory } from "@repo/testing/factory"
import { getFirestore } from "firebase-admin/firestore"
import firebaseFunctionsTest from "firebase-functions-test"
import { type Request } from "firebase-functions/https"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { populate_race_seed } from "~/index"
import { populateRaceSeed } from "~/populate-race-seed"

const test = firebaseFunctionsTest()

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
  }
})

const cleanupCollection = async (collectionRef: FirebaseFirestore.Query) => {
  const snapshot = await collectionRef.get()
  const batch = getFirestore().batch()
  snapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
}

const createSeed = async (overrides: Partial<MarathonSeedDocWithId> = {}): Promise<MarathonSeedDocWithId> => {
  const seedData = marathonSeedFactory(overrides)
  await refs[TABLES.MARATHON_SEEDS].doc(seedData.id).set(seedData)
  return seedData
}

const setReadyImages = async (readyImages: ReadyImagesDoc) => {
  await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set(readyImages)
}

const seedRound = (gameId: string, sphericalId: string) => ({
  gameId,
  sphericalId,
  sphericalImageUrl: mockedSphericalImageURL,
  flatId: null,
  flatImageUrl: null,
})

beforeEach(async () => {
  await cleanupCollection(refs[TABLES.MARATHON_SEEDS])
  await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).delete()
})

describe("populateRaceSeed", () => {
  it("should return null if the seed does not exist", async () => {
    const result = await populateRaceSeed("non-existent-seed", 0)

    expect(result).toBeNull()
  })

  it("should not extend the seed when the player still has enough rounds ahead", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await setReadyImages({ sphericals: [{ id: spherical.id, gameId: game.id, image: spherical.image }], flats: [] })

    const existingRounds = Array.from({ length: RACE_SEED_EXTENSION_THRESHOLD + 1 }, (_, i) =>
      seedRound(game.id, `sph-${i}`)
    )

    const seed = await createSeed({ rounds: existingRounds })

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(existingRounds.length)
  })

  it("should extend the seed with new sphericals when player is close to the end", async () => {
    const game = gameFactory({})
    const spherical1 = sphericalFactory({ gameId: game.id, image: "https://example.com/1.jpg" })
    const spherical2 = sphericalFactory({ gameId: game.id, image: "https://example.com/2.jpg" })

    await setReadyImages({
      sphericals: [
        { id: spherical1.id, gameId: game.id, image: spherical1.image },
        { id: spherical2.id, gameId: game.id, image: spherical2.image },
      ],
      flats: [],
    })

    const seed = await createSeed()

    const result = await populateRaceSeed(seed.id, 0)

    expect(result).not.toBeNull()
    expect(result?.rounds.length).toBeGreaterThan(0)
    const addedIds = result?.rounds.map((r) => r.sphericalId)
    expect(addedIds).toEqual(expect.arrayContaining([spherical1.id, spherical2.id]))
  })

  it("should skip sphericals already present in the seed", async () => {
    const game = gameFactory({})
    const usedSpherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })
    const freshSpherical = sphericalFactory({ gameId: game.id, image: "https://example.com/fresh.jpg" })

    await setReadyImages({
      sphericals: [
        { id: usedSpherical.id, gameId: game.id, image: usedSpherical.image },
        { id: freshSpherical.id, gameId: game.id, image: freshSpherical.image },
      ],
      flats: [],
    })

    const seed = await createSeed({ rounds: [seedRound(game.id, usedSpherical.id)] })

    const result = await populateRaceSeed(seed.id, 0)

    const allSphericalIds = result?.rounds.map((r) => r.sphericalId) || []
    expect(allSphericalIds.filter((id) => id === usedSpherical.id)).toHaveLength(1) // still there from existing rounds
    expect(allSphericalIds).toContain(freshSpherical.id)
    expect(allSphericalIds.filter((id) => id === freshSpherical.id)).toHaveLength(1) // not duplicated
  })

  it("should only include images from the metadata doc", async () => {
    const game = gameFactory({})
    const readySpherical = sphericalFactory({ gameId: game.id, image: "https://example.com/ready.jpg" })

    // Only the ready one is in the metadata doc
    await setReadyImages({
      sphericals: [{ id: readySpherical.id, gameId: game.id, image: readySpherical.image }],
      flats: [],
    })

    const seed = await createSeed()

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(1)
    expect(result?.rounds[0]?.sphericalId).toBe(readySpherical.id)
  })

  it("should skip sphericals with no image", async () => {
    const game = gameFactory({})
    const withImage = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await setReadyImages({
      sphericals: [
        { id: withImage.id, gameId: game.id, image: withImage.image },
        { id: "no-image-id", gameId: game.id, image: "" },
      ],
      flats: [],
    })

    const seed = await createSeed()

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(1)
    expect(result?.rounds[0]?.sphericalId).toBe(withImage.id)
  })

  it("should not extend if no new images are available", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await setReadyImages({
      sphericals: [{ id: spherical.id, gameId: game.id, image: spherical.image }],
      flats: [],
    })

    // Seed already contains the only available spherical
    const seed = await createSeed({ rounds: [seedRound(game.id, spherical.id)] })

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(1)
  })

  it("should be idempotent when called concurrently", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await setReadyImages({
      sphericals: [{ id: spherical.id, gameId: game.id, image: spherical.image }],
      flats: [],
    })

    const seed = await createSeed()

    await Promise.all([
      populateRaceSeed(seed.id, 0),
      populateRaceSeed(seed.id, 0),
    ])

    const updatedSnap = await refs[TABLES.MARATHON_SEEDS].doc(seed.id).get()
    const updatedSeed = updatedSnap.data() as MarathonSeedDoc

    // Spherical should only appear once despite concurrent calls
    const occurrences = updatedSeed.rounds.filter((r) => r.sphericalId === spherical.id).length
    expect(occurrences).toBe(1)
  })
})

describe("populate_race_seed cloud function", () => {
  const cloudFnWrap = test.wrap(populate_race_seed)

  const callAs = (uid: string | undefined, data: unknown) =>
    cloudFnWrap({
      data,
      auth: uid ? { uid, token: {} as DecodedIdToken, rawToken: "" } : undefined,
      rawRequest: {} as unknown as Request,
      acceptsStreaming: false,
    })

  it("should throw unauthenticated when no auth", async () => {
    await expect(callAs(undefined, {})).rejects.toMatchObject({ code: "unauthenticated" })
  })

  it("should throw invalid-argument when payload is missing seedId", async () => {
    await expect(callAs("user1", { playerCurrentIndex: 0 })).rejects.toMatchObject({ code: "invalid-argument" })
  })

  it("should throw not-found when seed does not exist", async () => {
    await expect(callAs("user1", { seedId: "non-existent", playerCurrentIndex: 0 })).rejects.toMatchObject({ code: "not-found" })
  })

  it("should return the total round count on success", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await setReadyImages({
      sphericals: [{ id: spherical.id, gameId: game.id, image: spherical.image }],
      flats: [],
    })

    const seed = await createSeed()

    const result = await callAs("user1", { seedId: seed.id, playerCurrentIndex: 0 })

    expect(result.rounds).toBeGreaterThan(0)
  })
})
