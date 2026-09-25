import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { buildCardPools, cardPoolDocSchema } from "~/firestore/card-pool"

const CARD_NUMBER = 42

const ENTRY = { cardId: "kanto-card", gameId: "pokemon-red" }

describe("when the pool lists cards", () => {
  it("should keep them", () => {
    expect(cardPoolDocSchema.parse({ cards: [ENTRY] })).toEqual({
      cards: [ENTRY],
    })
  })
})

describe("when the pool is empty", () => {
  it("should accept it", () => {
    expect(cardPoolDocSchema.parse({ cards: [] })).toEqual({ cards: [] })
  })
})

describe("when an entry has no game", () => {
  it("should reject it", () => {
    expect(
      cardPoolDocSchema.safeParse({ cards: [{ cardId: ENTRY.cardId }] })
        .success,
    ).toBe(false)
  })
})

describe("when an entry has no card", () => {
  it("should reject it", () => {
    expect(
      cardPoolDocSchema.safeParse({
        cards: [{ mapId: "kanto", gameId: ENTRY.gameId }],
      }).success,
    ).toBe(false)
  })
})

describe("when the card pools are built from cards", () => {
  const LEGENDARY_ENTRY = { cardId: "kanto-card", gameId: "pokemon-red" }
  const COMMON_ENTRY = { cardId: "route-1-card", gameId: "pokemon-red" }
  const pools = buildCardPools([
    {
      ...LEGENDARY_ENTRY,
      cardProperties: { rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER },
    },
    {
      ...COMMON_ENTRY,
      cardProperties: { rarity: CARD_RARITY.COMMON, number: CARD_NUMBER },
    },
  ])

  it("should build one pool per rarity", () => {
    expect(pools.map(({ rarity }) => rarity)).toEqual(
      Object.values(CARD_RARITY),
    )
  })

  it("should put each card in the pool of its rarity", () => {
    expect(
      pools.find(({ rarity }) => rarity === CARD_RARITY.LEGENDARY)?.pool,
    ).toEqual({ cards: [LEGENDARY_ENTRY] })
  })

  it("should keep an empty pool for a rarity without cards", () => {
    expect(
      pools.find(({ rarity }) => rarity === CARD_RARITY.RARE)?.pool,
    ).toEqual({ cards: [] })
  })
})
