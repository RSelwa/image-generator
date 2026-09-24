import { ACHIEVEMENT_KEYS } from "@repo/common"
import { describe, expect, it } from "vitest"
import { isAchievementEventVerified } from "@/utils/achievement-events"

describe("when the event is a change_username", () => {
  it("should verify a changed pseudo", () => {
    expect(
      isAchievementEventVerified(ACHIEVEMENT_KEYS.CHANGE_USERNAME, {
        key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
        before: { pseudo: "old" },
        after: { pseudo: "new" },
      }),
    ).toBe(true)
  })

  it("should reject an unchanged pseudo", () => {
    expect(
      isAchievementEventVerified(ACHIEVEMENT_KEYS.CHANGE_USERNAME, {
        key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
        before: { pseudo: "same" },
        after: { pseudo: "same" },
      }),
    ).toBe(false)
  })
})
