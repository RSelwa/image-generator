import { ACHIEVEMENT_KEYS } from "@repo/common"
import { describe, expect, it } from "vitest"
import { isAchievementEventVerified } from "@/utils/achievement-events"

const buildChangeUsernameEvent = (before: string, after: string) => ({
  key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
  before: { pseudo: before },
  after: { pseudo: after },
})

describe("when the event is a change_username", () => {
  it("should verify a changed pseudo matching the stored one", () => {
    expect(
      isAchievementEventVerified(
        ACHIEVEMENT_KEYS.CHANGE_USERNAME,
        buildChangeUsernameEvent("old", "new"),
        { pseudo: "new" },
      ),
    ).toBe(true)
  })

  it("should reject an unchanged pseudo", () => {
    expect(
      isAchievementEventVerified(
        ACHIEVEMENT_KEYS.CHANGE_USERNAME,
        buildChangeUsernameEvent("same", "same"),
        { pseudo: "same" },
      ),
    ).toBe(false)
  })

  it("should reject a pseudo the stored user does not carry", () => {
    expect(
      isAchievementEventVerified(
        ACHIEVEMENT_KEYS.CHANGE_USERNAME,
        buildChangeUsernameEvent("old", "forged"),
        { pseudo: "old" },
      ),
    ).toBe(false)
  })
})
