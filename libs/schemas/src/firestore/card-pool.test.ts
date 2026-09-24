import { describe, expect, it } from "vitest"
import { cardPoolDocSchema } from "~/firestore/card-pool"

const ENTRY = { mapId: "kanto", gameId: "pokemon-red" }

describe("when the pool lists maps", () => {
  it("should keep them", () => {
    expect(cardPoolDocSchema.parse({ maps: [ENTRY] })).toEqual({
      maps: [ENTRY],
    })
  })
})

describe("when the pool is empty", () => {
  it("should accept it", () => {
    expect(cardPoolDocSchema.parse({ maps: [] })).toEqual({ maps: [] })
  })
})

describe("when an entry has no game", () => {
  it("should reject it", () => {
    expect(
      cardPoolDocSchema.safeParse({ maps: [{ mapId: ENTRY.mapId }] }).success,
    ).toBe(false)
  })
})
