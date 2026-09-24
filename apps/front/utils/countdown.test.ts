import { describe, expect, it } from "vitest"
import { formatCountdown } from "@/utils/countdown"

describe("when the remaining time is several minutes", () => {
  it("should show minutes and padded seconds", () => {
    expect(formatCountdown(9 * 60_000 + 5_000)).toBe("9:05")
  })
})

describe("when the remaining time has a fraction of a second", () => {
  it("should round the seconds up", () => {
    expect(formatCountdown(1_200)).toBe("0:02")
  })
})

describe("when the time is already up", () => {
  it("should show zero", () => {
    expect(formatCountdown(-500)).toBe("0:00")
  })
})
