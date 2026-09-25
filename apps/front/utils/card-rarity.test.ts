import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { type CardDoc, type CardRarity, type MapDocWithId } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import {
  countMapsByCardRarity,
  filterMapsByCardRarity,
  getCardRarityByMapId,
} from "@/utils/card-rarity"

const CARD_NUMBER = 42

const buildMap = (id: string) =>
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
  }) satisfies MapDocWithId

const buildCard = (mapId: string, rarity: CardRarity) =>
  ({
    type: CARD_TYPE.MAP,
    gameId: "game",
    mapId,
    cardProperties: { rarity, number: CARD_NUMBER },
    createdAt: null,
    updatedAt: null,
  }) satisfies CardDoc

const LEGENDARY_MAP = buildMap("legendary")
const COMMON_MAP = buildMap("common")
const UNRATED_MAP = buildMap("unrated")
const MAPS = [LEGENDARY_MAP, COMMON_MAP, UNRATED_MAP]
const GAME_CARD = {
  type: CARD_TYPE.GAME,
  gameId: "game",
  cardProperties: { rarity: CARD_RARITY.RARE, number: CARD_NUMBER },
  createdAt: null,
  updatedAt: null,
} satisfies CardDoc
const RARITY_BY_MAP_ID = getCardRarityByMapId([
  buildCard(LEGENDARY_MAP.id, CARD_RARITY.LEGENDARY),
  buildCard(COMMON_MAP.id, CARD_RARITY.COMMON),
  GAME_CARD,
])

describe("when the cards are indexed by map", () => {
  it("should map each map card's map to its rarity", () => {
    expect(RARITY_BY_MAP_ID).toEqual(
      new Map([
        [LEGENDARY_MAP.id, CARD_RARITY.LEGENDARY],
        [COMMON_MAP.id, CARD_RARITY.COMMON],
      ]),
    )
  })
})

describe("when every map is requested", () => {
  it("should keep them all", () => {
    expect(
      filterMapsByCardRarity(MAPS, RARITY_BY_MAP_ID, CARD_RARITY_FILTER.ALL),
    ).toEqual(MAPS)
  })
})

describe("when the unrated maps are requested", () => {
  it("should keep only the maps without a card", () => {
    expect(
      filterMapsByCardRarity(
        MAPS,
        RARITY_BY_MAP_ID,
        CARD_RARITY_FILTER.NOT_RATED,
      ),
    ).toEqual([UNRATED_MAP])
  })
})

describe("when a rarity is requested", () => {
  it("should keep only the maps of that rarity", () => {
    expect(
      filterMapsByCardRarity(MAPS, RARITY_BY_MAP_ID, CARD_RARITY.LEGENDARY),
    ).toEqual([LEGENDARY_MAP])
  })

  it("should return nothing when no map has it", () => {
    expect(
      filterMapsByCardRarity(MAPS, RARITY_BY_MAP_ID, CARD_RARITY.RARE),
    ).toEqual([])
  })
})

describe("when the maps are counted by rarity", () => {
  it("should count each option", () => {
    expect(
      countMapsByCardRarity(MAPS, RARITY_BY_MAP_ID, [
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
