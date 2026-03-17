import { mockedSphericalImageURL, RACE_SEED_EXTENSION_THRESHOLD, TABLES } from "@repo/common"
import { collectionGroupRefs, refs, subRefs } from "@repo/providers/db-refs"
import { type DecodedIdToken } from "@repo/providers/firebase"
import { type MarathonSeedDoc, type MarathonSeedDocWithId } from "@repo/schemas"
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

const seedRound = (gameId: string, sphericalId: string) => ({
  gameId,
  sphericalId,
  sphericalImageUrl: mockedSphericalImageURL,
  flatId: null,
  flatImageUrl: null,
})

beforeEach(async () => {
  await cleanupCollection(refs[TABLES.MARATHON_SEEDS])
  await cleanupCollection(refs[TABLES.GAMES])
  await cleanupCollection(collectionGroupRefs[TABLES.SPHERICAL])
  await cleanupCollection(collectionGroupRefs[TABLES.FLAT])
})

describe("populateRaceSeed", () => {
  it("should return null if the seed does not exist", async () => {
    const result = await populateRaceSeed("non-existent-seed", 0)

    expect(result).toBeNull()
  })

  it("should not extend the seed when the player still has enough rounds ahead", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

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

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical1.id).set(spherical1)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical2.id).set(spherical2)

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

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(usedSpherical.id).set(usedSpherical)
    await subRefs[TABLES.SPHERICAL](game.id).doc(freshSpherical.id).set(freshSpherical)

    const seed = await createSeed({ rounds: [seedRound(game.id, usedSpherical.id)] })

    const result = await populateRaceSeed(seed.id, 0)

    const allSphericalIds = result?.rounds.map((r) => r.sphericalId) || []
    expect(allSphericalIds.filter((id) => id === usedSpherical.id)).toHaveLength(1) // still there from existing rounds
    expect(allSphericalIds).toContain(freshSpherical.id)
    expect(allSphericalIds.filter((id) => id === freshSpherical.id)).toHaveLength(1) // not duplicated
  })

  it("should include sphericals regardless of status", async () => {
    const game = gameFactory({})
    const waitingSpherical = sphericalFactory({ gameId: game.id, image: "https://example.com/waiting.jpg", status: "waiting" })
    const readySpherical = sphericalFactory({ gameId: game.id, image: "https://example.com/ready.jpg", status: "ready" })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(waitingSpherical.id).set(waitingSpherical)
    await subRefs[TABLES.SPHERICAL](game.id).doc(readySpherical.id).set(readySpherical)

    const seed = await createSeed()

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(2)
  })

  it("should skip sphericals with no image", async () => {
    const game = gameFactory({})
    const withImage = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })
    const withoutImage = sphericalFactory({ gameId: game.id, image: "" })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(withImage.id).set(withImage)
    await subRefs[TABLES.SPHERICAL](game.id).doc(withoutImage.id).set(withoutImage)

    const seed = await createSeed()

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(1)
    expect(result?.rounds[0]?.sphericalId).toBe(withImage.id)
  })

  it("should not extend if no new images are available", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    // Seed already contains the only available spherical
    const seed = await createSeed({ rounds: [seedRound(game.id, spherical.id)] })

    const result = await populateRaceSeed(seed.id, 0)

    expect(result?.rounds.length).toBe(1)
  })

  it("should be idempotent when called concurrently", async () => {
    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

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

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const seed = await createSeed()

    const result = await callAs("user1", { seedId: seed.id, playerCurrentIndex: 0 })

    expect(result.rounds).toBeGreaterThan(0)
  })
})
