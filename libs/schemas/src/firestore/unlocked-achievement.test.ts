import { Timestamp } from "@firebase/firestore"
import { describe, expect, it } from "vitest"
import { unlockedAchievementDocSchema } from "~/firestore/unlocked-achievement"

describe("unlockedAchievementDocSchema", () => {
  describe("when the unlock has its date and reward", () => {
    it("should keep them", () => {
      const achievedAt = Timestamp.now()

      expect(
        unlockedAchievementDocSchema.parse({ achievedAt, reward: 50 }),
      ).toEqual({ achievedAt, reward: 50 })
    })
  })

  describe("when the unlock has no date", () => {
    it("should reject it", () => {
      expect(
        unlockedAchievementDocSchema.safeParse({ reward: 50 }).success,
      ).toBe(false)
    })
  })
})
