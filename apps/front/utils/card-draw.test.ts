import {
  CARD_RARITY,
  CARD_TYPE,
  GUARANTEED_CARD_RARITIES,
  PACK_SIZE,
} from "@repo/common"
import { type CardDocWithId, type CardRarity } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { drawRarities, pickCard } from "@/utils/card-draw"

const LOWEST_DRAW = 0
const HIGHEST_DRAW = 0.999_999

const buildRandom = (value: number) => () => value

const buildCard = (id: string, rarity: CardRarity) =>
  ({
    id,
    type: CARD_TYPE.GAME,
    gameId: "game",
    rarity,
    number: 1,
    createdAt: null,
    updatedAt: null,
  }) satisfies CardDocWithId

const buildPools = (pools: Partial<Record<CardRarity, CardDocWithId[]>>) => ({
  [CARD_RARITY.COMMON]: [],
  [CARD_RARITY.UNCOMMON]: [],
  [CARD_RARITY.RARE]: [],
  [CARD_RARITY.ULTRA_RARE]: [],
  [CARD_RARITY.LEGENDARY]: [],
  ...pools,
})

describe("when the pack rarities are drawn", () => {
  it("should draw one rarity per card", () => {
    expect(drawRarities(Math.random)).toHaveLength(PACK_SIZE)
  })

  it("should draw common on the lowest roll", () => {
    expect(drawRarities(buildRandom(LOWEST_DRAW))[0]).toBe(CARD_RARITY.COMMON)
  })

  it("should draw legendary on the highest roll", () => {
    expect(drawRarities(buildRandom(HIGHEST_DRAW))[0]).toBe(
      CARD_RARITY.LEGENDARY,
    )
  })

  it.each([
    [0.6, CARD_RARITY.UNCOMMON],
    [0.85, CARD_RARITY.RARE],
    [0.95, CARD_RARITY.ULTRA_RARE],
  ])("should draw %s as %s", (roll, rarity) => {
    expect(drawRarities(buildRandom(roll))[0]).toBe(rarity)
  })

  it("should guarantee a rare or better last card", () => {
    expect(GUARANTEED_CARD_RARITIES).toContain(
      drawRarities(buildRandom(LOWEST_DRAW)).at(-1),
    )
  })

  it("should reach legendary on the last card", () => {
    expect(drawRarities(buildRandom(HIGHEST_DRAW)).at(-1)).toBe(
      CARD_RARITY.LEGENDARY,
    )
  })
})

describe("when a card is picked from its pool", () => {
  it("should pick the card the roll points to", () => {
    const pools = buildPools({
      [CARD_RARITY.RARE]: [
        buildCard("first", CARD_RARITY.RARE),
        buildCard("second", CARD_RARITY.RARE),
      ],
    })

    expect(
      pickCard(pools, CARD_RARITY.RARE, buildRandom(HIGHEST_DRAW)),
    ).toEqual({
      rarity: CARD_RARITY.RARE,
      card: buildCard("second", CARD_RARITY.RARE),
    })
  })
})

describe("when the pool of the drawn rarity is empty", () => {
  it("should fall back to the next rarity down", () => {
    const pools = buildPools({
      [CARD_RARITY.COMMON]: [buildCard("common", CARD_RARITY.COMMON)],
      [CARD_RARITY.UNCOMMON]: [buildCard("uncommon", CARD_RARITY.UNCOMMON)],
    })

    expect(
      pickCard(pools, CARD_RARITY.LEGENDARY, buildRandom(LOWEST_DRAW)),
    ).toEqual({
      rarity: CARD_RARITY.UNCOMMON,
      card: buildCard("uncommon", CARD_RARITY.UNCOMMON),
    })
  })

  it("should fall back to a higher rarity when no lower pool has cards", () => {
    const pools = buildPools({
      [CARD_RARITY.RARE]: [buildCard("rare", CARD_RARITY.RARE)],
    })

    expect(
      pickCard(pools, CARD_RARITY.COMMON, buildRandom(LOWEST_DRAW)),
    ).toEqual({
      rarity: CARD_RARITY.RARE,
      card: buildCard("rare", CARD_RARITY.RARE),
    })
  })
})

describe("when every pool is empty", () => {
  it("should pick no card", () => {
    expect(
      pickCard(buildPools({}), CARD_RARITY.RARE, buildRandom(LOWEST_DRAW)),
    ).toBeNull()
  })
})
