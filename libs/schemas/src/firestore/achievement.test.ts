import { ACHIEVEMENT_DIFFICULTY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { achievementDocSchema } from "~/firestore/achievement"

const ACHIEVEMENT = {
  key: "change_username",
  name: "New identity",
  description: "Change your username",
  reward: 50,
}

describe("achievementDocSchema", () => {
  describe("when the achievement has only its required fields", () => {
    it("should leave difficulty and goal unset", () => {
      const achievement = achievementDocSchema.parse(ACHIEVEMENT)

      expect(achievement).not.toHaveProperty("difficulty")
      expect(achievement).not.toHaveProperty("goalToAchieve")
    })
  })

  describe("when the achievement is legendary with a goal", () => {
    it("should keep them", () => {
      expect(
        achievementDocSchema.parse({
          ...ACHIEVEMENT,
          difficulty: ACHIEVEMENT_DIFFICULTY.LEGENDARY,
          goalToAchieve: 10,
        }),
      ).toMatchObject({
        difficulty: ACHIEVEMENT_DIFFICULTY.LEGENDARY,
        goalToAchieve: 10,
      })
    })
  })

  describe("when the difficulty is unknown", () => {
    it("should reject it", () => {
      expect(
        achievementDocSchema.safeParse({ ...ACHIEVEMENT, difficulty: "insane" })
          .success,
      ).toBe(false)
    })
  })

  describe("when the reward is negative", () => {
    it("should reject it", () => {
      expect(
        achievementDocSchema.safeParse({ ...ACHIEVEMENT, reward: -1 }).success,
      ).toBe(false)
    })
  })

  describe("when the goal is not a positive integer", () => {
    it.each([0, 1.5])("should reject %s", (goalToAchieve) => {
      expect(
        achievementDocSchema.safeParse({ ...ACHIEVEMENT, goalToAchieve })
          .success,
      ).toBe(false)
    })
  })
})
