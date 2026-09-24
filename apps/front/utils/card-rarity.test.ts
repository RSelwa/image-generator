import { CARD_RARITY } from "@repo/common"
import { type MapDocWithId } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import {
  countMapsByCardRarity,
  filterMapsByCardRarity,
} from "@/utils/card-rarity"

const CARD_NUMBER = 42

const buildMap = (
  id: string,
  cardProperties?: MapDocWithId["cardProperties"],
) =>
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
    cardProperties,
  }) satisfies MapDocWithId

const LEGENDARY_MAP = buildMap("legendary", {
  rarity: CARD_RARITY.LEGENDARY,
  number: CARD_NUMBER,
})
const COMMON_MAP = buildMap("common", {
  rarity: CARD_RARITY.COMMON,
  number: CARD_NUMBER,
})
const UNRATED_MAP = buildMap("unrated")
const MAPS = [LEGENDARY_MAP, COMMON_MAP, UNRATED_MAP]

describe("when every map is requested", () => {
  it("should keep them all", () => {
    expect(filterMapsByCardRarity(MAPS, CARD_RARITY_FILTER.ALL)).toEqual(MAPS)
  })
})

describe("when the unrated maps are requested", () => {
  it("should keep only the maps without card properties", () => {
    expect(filterMapsByCardRarity(MAPS, CARD_RARITY_FILTER.NOT_RATED)).toEqual([
      UNRATED_MAP,
    ])
  })
})

describe("when a rarity is requested", () => {
  it("should keep only the maps of that rarity", () => {
    expect(filterMapsByCardRarity(MAPS, CARD_RARITY.LEGENDARY)).toEqual([
      LEGENDARY_MAP,
    ])
  })

  it("should return nothing when no map has it", () => {
    expect(filterMapsByCardRarity(MAPS, CARD_RARITY.RARE)).toEqual([])
  })
})

describe("when the maps are counted by rarity", () => {
  it("should count each option", () => {
    expect(
      countMapsByCardRarity(MAPS, [
        { value: CARD_RARITY_FILTER.ALL, label: "All maps" },
        { value: CARD_RARITY_FILTER.NOT_RATED, label: "Not rated" },
        { value: CARD_RARITY.LEGENDARY, label: CARD_RARITY.LEGENDARY },
        { value: CARD_RARITY.RARE, label: CARD_RARITY.RARE },
      ]),
    ).toEqual([
      { value: CARD_RARITY_FILTER.ALL, label: "All maps", count: 3 },
      { value: CARD_RARITY_FILTER.NOT_RATED, label: "Not rated", count: 1 },
      { value: CARD_RARITY.LEGENDARY, label: CARD_RARITY.LEGENDARY, count: 1 },
      { value: CARD_RARITY.RARE, label: CARD_RARITY.RARE, count: 0 },
    ])
  })
})
