import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import { cardRarityFilterSchema } from "@/schemas/card-rarity-filter"

describe("when the filter value is a rarity", () => {
  it("should keep it", () => {
    expect(cardRarityFilterSchema.parse(CARD_RARITY.LEGENDARY)).toBe(
      CARD_RARITY.LEGENDARY,
    )
  })
})

describe("when the filter value is the unrated maps", () => {
  it("should keep it", () => {
    expect(cardRarityFilterSchema.parse(CARD_RARITY_FILTER.NOT_RATED)).toBe(
      CARD_RARITY_FILTER.NOT_RATED,
    )
  })
})

describe("when the filter value is unknown", () => {
  it("should fall back to every map", () => {
    expect(cardRarityFilterSchema.parse("mythic")).toBe(CARD_RARITY_FILTER.ALL)
  })
})
