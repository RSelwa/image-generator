import { ACHIEVEMENT_KEYS } from "@repo/common"
import { describe, expect, it } from "vitest"
import { isUsernameChanged } from "@/utils/achievement-event.change-username"

const buildChangeUsernameEvent = (before: string, after: string) => ({
  key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
  before: { pseudo: before },
  after: { pseudo: after },
})

describe("when the event is a change_username", () => {
  it("should verify a changed pseudo matching the stored one", () => {
    expect(
      isUsernameChanged(buildChangeUsernameEvent("old", "new"), {
        pseudo: "new",
      }),
    ).toBe(true)
  })

  it("should reject an unchanged pseudo", () => {
    expect(
      isUsernameChanged(buildChangeUsernameEvent("same", "same"), {
        pseudo: "same",
      }),
    ).toBe(false)
  })

  it("should reject a pseudo the stored user does not carry", () => {
    expect(
      isUsernameChanged(buildChangeUsernameEvent("old", "forged"), {
        pseudo: "old",
      }),
    ).toBe(false)
  })
})
