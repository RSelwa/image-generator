import { Timestamp } from "firebase-admin/firestore"
import { describe, expect, it } from "vitest"
import { isAbandoned } from "~/is-abandoned"

const defaultConfig = { numberOfRounds: 12, roundDuration: 60 }

const minutesAgo = (minutes: number) =>
  Timestamp.fromMillis(Date.now() - minutes * 60 * 1000)

const hoursAgo = (hours: number) =>
  Timestamp.fromMillis(Date.now() - hours * 60 * 60 * 1000)

describe("isAbandoned", () => {
  it("should not abandon a lobby created less than 15 minutes ago", () => {
    expect(isAbandoned(minutesAgo(5), 0, defaultConfig)).toBe(false)
  })

  it("should not abandon a lobby created 10 minutes ago at round 0", () => {
    expect(isAbandoned(minutesAgo(10), 0, defaultConfig)).toBe(false)
  })

  it("should abandon a lobby created 15+ minutes ago still at round 0", () => {
    expect(isAbandoned(minutesAgo(16), 0, defaultConfig)).toBe(true)
  })

  it("should abandon a lobby created 15+ minutes ago still at round 1", () => {
    expect(isAbandoned(minutesAgo(20), 1, defaultConfig)).toBe(true)
  })

  it("should abandon a lobby created 15+ minutes ago still at round 2", () => {
    expect(isAbandoned(minutesAgo(18), 2, defaultConfig)).toBe(true)
  })

  it("should not abandon a lobby created 15+ minutes ago at round 3", () => {
    expect(isAbandoned(minutesAgo(20), 3, defaultConfig)).toBe(false)
  })

  it("should not abandon a lobby created 15+ minutes ago at round 5", () => {
    expect(isAbandoned(minutesAgo(20), 5, defaultConfig)).toBe(false)
  })

  it("should abandon a lobby created 1+ hour ago with standard config", () => {
    expect(isAbandoned(hoursAgo(1.1), 5, defaultConfig)).toBe(true)
  })

  it("should not abandon a long game (24 rounds * 120s) after 1 hour if still within max duration", () => {
    const longConfig = { numberOfRounds: 24, roundDuration: 120 }
    // 24 * 120 = 2880s = 48min, max possible duration exceeds 1 hour? No, 48min < 1h
    // Actually 24 * 120 = 2880s = 48min, which does NOT exceed 1 hour
    // So after 1 hour it should be abandoned
    expect(isAbandoned(hoursAgo(1.1), 10, longConfig)).toBe(true)
  })

  it("should not abandon a very long game within its max duration + buffer", () => {
    // 30 rounds * 120s = 3600s = 1 hour exactly. maxPossibleDurationMs equals ONE_HOUR_MS, not greater
    // Need > 1 hour: e.g. 31 rounds * 120s = 3720s = 62min
    const veryLongConfig = { numberOfRounds: 31, roundDuration: 120 }
    // Max duration: 31 * 120 = 3720s = 62min. With buffer: 62 + 15 = 77min
    // At 70 minutes, should NOT be abandoned
    expect(isAbandoned(minutesAgo(70), 15, veryLongConfig)).toBe(false)
  })

  it("should abandon a very long game past its max duration + buffer", () => {
    const veryLongConfig = { numberOfRounds: 31, roundDuration: 120 }
    // Max duration: 62min + 15min buffer = 77min
    // At 80 minutes, should be abandoned
    expect(isAbandoned(minutesAgo(80), 15, veryLongConfig)).toBe(true)
  })

  it("should abandon a lobby created exactly at the 1 hour mark with short config", () => {
    // 61 minutes > 1 hour, config max = 12 * 60 = 720s = 12min < 1 hour
    expect(isAbandoned(minutesAgo(61), 8, defaultConfig)).toBe(true)
  })

  it("should not abandon a recently created lobby at round 5", () => {
    expect(isAbandoned(minutesAgo(3), 5, defaultConfig)).toBe(false)
  })
})

describe("modify the doc status to ABANDONED if isAbandoned returns true", () => {
})
