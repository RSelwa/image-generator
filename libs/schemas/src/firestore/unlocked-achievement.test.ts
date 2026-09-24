import { Timestamp } from "@firebase/firestore"
import { describe, expect, it } from "vitest"
import { unlockedAchievementDocSchema } from "~/firestore/unlocked-achievement"

const KEY = "change_username"

describe("unlockedAchievementDocSchema", () => {
  describe("when the unlock has its key, date and reward", () => {
    it("should keep them", () => {
      const achievedAt = Timestamp.now()

      expect(
        unlockedAchievementDocSchema.parse({
          key: KEY,
          achievedAt,
          reward: 50,
        }),
      ).toEqual({ key: KEY, achievedAt, reward: 50 })
    })
  })

  describe("when the unlock has no date", () => {
    it("should reject it", () => {
      expect(
        unlockedAchievementDocSchema.safeParse({ key: KEY, reward: 50 })
          .success,
      ).toBe(false)
    })
  })

  describe("when the unlock has no key", () => {
    it("should reject it", () => {
      expect(
        unlockedAchievementDocSchema.safeParse({
          achievedAt: Timestamp.now(),
          reward: 50,
        }).success,
      ).toBe(false)
    })
  })
})
