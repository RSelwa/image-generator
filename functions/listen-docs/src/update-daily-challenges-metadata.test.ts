import { DIFFICULTIES, METADATA_DOCS, TABLES } from "@repo/common"
import { type DailyChallengeDoc, type DailyChallengeHistoryDoc } from "@repo/schemas"
import { getFirestore } from "firebase-admin/firestore"
import firebaseFunctionsTest from "firebase-functions-test"
import { makeDocumentSnapshot } from "firebase-functions-test/lib/providers/firestore"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { listen_daily_challenges_written } from "~/index"

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
  }
})

const test = firebaseFunctionsTest()

const getDailyChallengePath = (date: string) => `${TABLES.DAILY_CHALLENGES}/${date}`

const getHistoryData = async () => {
  const doc = await getFirestore().doc(`${TABLES.METADATA}/${METADATA_DOCS.DAILY_CHALLENGE_HISTORY}`).get()

  return doc.data() as DailyChallengeHistoryDoc | undefined
}

const getHistoryRef = () =>
  getFirestore().doc(`${TABLES.METADATA}/${METADATA_DOCS.DAILY_CHALLENGE_HISTORY}`)

const makeSphericalChallenge = (overrides: Partial<DailyChallengeDoc> = {}): DailyChallengeDoc => ({
  date: "2026-03-15",
  isSpherical: true,
  gameId: "game-1",
  gameTitle: "Test Game",
  gameAlternateNames: null,
  sphericalId: "spherical-1",
  sphericalImageUrl: "https://example.com/spherical.jpg",
  flatId: null,
  flatImageUrl: null,
  mapId: null,
  mapImage: null,
  mapPosition: null,
  mapWidth: null,
  mapHeight: null,
  maxDistancePoints: null,
  difficulty: DIFFICULTIES.EASY,
  ...overrides,
})

const makeFlatChallenge = (overrides: Partial<DailyChallengeDoc> = {}): DailyChallengeDoc => ({
  date: "2026-03-16",
  isSpherical: false,
  gameId: "game-2",
  gameTitle: "Test Game 2",
  gameAlternateNames: null,
  sphericalId: null,
  sphericalImageUrl: null,
  flatId: "flat-1",
  flatImageUrl: "https://example.com/flat.jpg",
  mapId: null,
  mapImage: null,
  mapPosition: null,
  mapWidth: null,
  mapHeight: null,
  maxDistancePoints: null,
  difficulty: DIFFICULTIES.MEDIUM,
  ...overrides,
})

beforeEach(async () => {
  await getHistoryRef().delete()
})

describe("listen daily challenges docs changes for dailyChallengeHistory metadata", () => {
  describe("create", () => {
    it("should add sphericalId to history when a spherical challenge is created", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challenge = makeSphericalChallenge()

      const before = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({ "spherical-1": "2026-03-15" })
    })

    it("should add flatId to history when a flat challenge is created", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challenge = makeFlatChallenge()

      const before = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({ "flat-1": "2026-03-16" })
    })

    it("should create the metadata doc if it does not exist on first challenge creation", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challenge = makeSphericalChallenge()

      const before = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data).toBeDefined()
      expect(data?.usedImages).toEqual({ "spherical-1": "2026-03-15" })
    })

    it("should append to existing history when metadata doc already exists", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)

      await getHistoryRef().set({ usedImages: { "existing-image": "2026-03-10" } })

      const challenge = makeFlatChallenge()

      const before = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({
        "existing-image": "2026-03-10",
        "flat-1": "2026-03-16",
      })
    })
  })

  describe("delete", () => {
    it("should remove sphericalId from history when a spherical challenge is deleted", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challenge = makeSphericalChallenge()

      await getHistoryRef().set({ usedImages: { "spherical-1": "2026-03-15", "other-image": "2026-03-10" } })

      const before = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({ "other-image": "2026-03-10" })
    })

    it("should remove flatId from history when a flat challenge is deleted", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challenge = makeFlatChallenge()

      await getHistoryRef().set({ usedImages: { "flat-1": "2026-03-16", "other-image": "2026-03-10" } })

      const before = makeDocumentSnapshot(challenge, getDailyChallengePath(challenge.date))
      const after = makeDocumentSnapshot({}, getDailyChallengePath(challenge.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challenge.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({ "other-image": "2026-03-10" })
    })
  })

  describe("update", () => {
    it("should update history when a spherical challenge image changes", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challengeBefore = makeSphericalChallenge({ sphericalId: "spherical-old" })
      const challengeAfter = makeSphericalChallenge({ sphericalId: "spherical-new" })

      await getHistoryRef().set({ usedImages: { "spherical-old": "2026-03-15" } })

      const before = makeDocumentSnapshot(challengeBefore, getDailyChallengePath(challengeBefore.date))
      const after = makeDocumentSnapshot(challengeAfter, getDailyChallengePath(challengeAfter.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challengeBefore.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages["spherical-old"]).toBeUndefined()
      expect(data?.usedImages["spherical-new"]).toBe("2026-03-15")
    })

    it("should update history when a flat challenge image changes", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challengeBefore = makeFlatChallenge({ flatId: "flat-old" })
      const challengeAfter = makeFlatChallenge({ flatId: "flat-new" })

      await getHistoryRef().set({ usedImages: { "flat-old": "2026-03-16" } })

      const before = makeDocumentSnapshot(challengeBefore, getDailyChallengePath(challengeBefore.date))
      const after = makeDocumentSnapshot(challengeAfter, getDailyChallengePath(challengeAfter.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challengeBefore.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages["flat-old"]).toBeUndefined()
      expect(data?.usedImages["flat-new"]).toBe("2026-03-16")
    })

    it("should update history when challenge type changes from spherical to flat", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challengeBefore = makeSphericalChallenge()
      const challengeAfter = makeFlatChallenge({ date: "2026-03-15" })

      await getHistoryRef().set({ usedImages: { "spherical-1": "2026-03-15" } })

      const before = makeDocumentSnapshot(challengeBefore, getDailyChallengePath(challengeBefore.date))
      const after = makeDocumentSnapshot(challengeAfter, getDailyChallengePath(challengeAfter.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challengeBefore.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages["spherical-1"]).toBeUndefined()
      expect(data?.usedImages["flat-1"]).toBe("2026-03-15")
    })

    it("should not update history when image id does not change", async () => {
      const cloudFnWrap = test.wrap(listen_daily_challenges_written)
      const challengeBefore = makeSphericalChallenge()
      const challengeAfter = makeSphericalChallenge({ difficulty: DIFFICULTIES.HARD })

      await getHistoryRef().set({ usedImages: { "spherical-1": "2026-03-15" } })

      const before = makeDocumentSnapshot(challengeBefore, getDailyChallengePath(challengeBefore.date))
      const after = makeDocumentSnapshot(challengeAfter, getDailyChallengePath(challengeAfter.date))

      await cloudFnWrap({
        data: { before, after },
        params: { date: challengeBefore.date },
      })

      const data = await getHistoryData()

      expect(data?.usedImages).toEqual({ "spherical-1": "2026-03-15" })
    })
  })
})
