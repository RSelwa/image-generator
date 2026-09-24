import { CARD_RARITY } from "@repo/common"
import { type MapDocWithId } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import {
  formatCardNumber,
  getCardNumberIssues,
  getNextCardNumber,
} from "@/utils/card-number"

const buildMap = (id: string, number?: number) =>
  ({
    id,
    name: id,
    gameId: "game",
    imageUrl: null,
    width: null,
    height: null,
    createdAt: null,
    updatedAt: null,
    maxDistancePoints: null,
    gratitude: [],
    cardProperties: number ? { rarity: CARD_RARITY.COMMON, number } : undefined,
  }) satisfies MapDocWithId

describe("when the next card number is computed", () => {
  it("should follow the highest number used", () => {
    expect(
      getNextCardNumber([buildMap("a", 3), buildMap("b", 7), buildMap("c")]),
    ).toBe(8)
  })

  it("should start at one without any card", () => {
    expect(getNextCardNumber([buildMap("a")])).toBe(1)
  })
})

describe("when the card numbers are checked", () => {
  const issues = getCardNumberIssues([
    buildMap("a", 1),
    buildMap("b", 3),
    buildMap("c", 3),
    buildMap("d", 6),
    buildMap("e"),
  ])

  it("should list the numbers used more than once", () => {
    expect(issues.duplicates).toEqual([3])
  })

  it("should list the numbers skipped up to the highest one", () => {
    expect(issues.gaps).toEqual([2, 4, 5])
  })
})

describe("when every number is used once in a row", () => {
  it("should report no issue", () => {
    expect(getCardNumberIssues([buildMap("a", 1), buildMap("b", 2)])).toEqual({
      duplicates: [],
      gaps: [],
    })
  })
})

describe("when a card number is formatted", () => {
  it("should pad it to three digits", () => {
    expect(formatCardNumber(42)).toBe("#042")
  })

  it("should keep a longer number whole", () => {
    expect(formatCardNumber(1_234)).toBe("#1234")
  })
})
