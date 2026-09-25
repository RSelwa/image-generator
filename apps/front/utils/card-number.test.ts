import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { type CardDoc } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import {
  formatCardNumber,
  getCardNumberIssues,
  getNextCardNumber,
} from "@/utils/card-number"

const buildCard = (mapId: string, number: number) =>
  ({
    type: CARD_TYPE.MAP,
    gameId: "game",
    mapId,
    cardProperties: { rarity: CARD_RARITY.COMMON, number },
    createdAt: null,
    updatedAt: null,
  }) satisfies CardDoc

describe("when the next card number is computed", () => {
  it("should follow the highest number used", () => {
    expect(getNextCardNumber([buildCard("a", 3), buildCard("b", 7)])).toBe(8)
  })

  it("should start at one without any card", () => {
    expect(getNextCardNumber([])).toBe(1)
  })
})

describe("when the card numbers are checked", () => {
  const issues = getCardNumberIssues([
    buildCard("a", 1),
    buildCard("b", 3),
    buildCard("c", 3),
    buildCard("d", 6),
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
    expect(getCardNumberIssues([buildCard("a", 1), buildCard("b", 2)])).toEqual(
      {
        duplicates: [],
        gaps: [],
      },
    )
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
