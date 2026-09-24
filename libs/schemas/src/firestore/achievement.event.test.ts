import { ACHIEVEMENT_KEYS } from "@repo/common"
import { describe, expect, it } from "vitest"
import { achievementEventSchema } from "~/firestore/achievement.event"

const CHANGE_USERNAME_EVENT = {
  key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
  before: { pseudo: "old-name" },
  after: { pseudo: "new-name" },
}

describe("achievementEventSchema", () => {
  describe("when a change_username event carries before and after", () => {
    it("should parse it", () => {
      expect(achievementEventSchema.parse(CHANGE_USERNAME_EVENT)).toEqual(
        CHANGE_USERNAME_EVENT,
      )
    })
  })

  describe("when the user data carries other user fields", () => {
    it("should keep only the username", () => {
      expect(
        achievementEventSchema.parse({
          ...CHANGE_USERNAME_EVENT,
          before: { pseudo: "old-name", credits: 999, id: "uid" },
        }).before,
      ).toEqual({ pseudo: "old-name" })
    })
  })

  describe("when a change_username event misses before or after", () => {
    it.each(["before", "after"] as const)(
      "should reject a missing %s",
      (field) => {
        const { [field]: _, ...event } = CHANGE_USERNAME_EVENT

        expect(achievementEventSchema.safeParse(event).success).toBe(false)
      },
    )
  })

  describe("when the key is unknown", () => {
    it("should reject it", () => {
      expect(
        achievementEventSchema.safeParse({
          ...CHANGE_USERNAME_EVENT,
          key: "unknown_achievement",
        }).success,
      ).toBe(false)
    })
  })

  describe("when the payload carries a uid", () => {
    it("should reject it", () => {
      expect(
        achievementEventSchema.safeParse({
          ...CHANGE_USERNAME_EVENT,
          uid: "another-user",
        }).success,
      ).toBe(false)
    })
  })
})
