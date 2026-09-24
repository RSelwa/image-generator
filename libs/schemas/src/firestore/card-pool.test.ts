import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { buildCardPools, cardPoolDocSchema } from "~/firestore/card-pool"

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

describe("when the card pools are built from maps", () => {
  const LEGENDARY_ENTRY = { mapId: "kanto", gameId: "pokemon-red" }
  const COMMON_ENTRY = { mapId: "route-1", gameId: "pokemon-red" }
  const pools = buildCardPools([
    { ...LEGENDARY_ENTRY, cardProperties: { rarity: CARD_RARITY.LEGENDARY } },
    { ...COMMON_ENTRY, cardProperties: { rarity: CARD_RARITY.COMMON } },
    { mapId: "unrated", gameId: "pokemon-red" },
  ])

  it("should build one pool per rarity", () => {
    expect(pools.map(({ rarity }) => rarity)).toEqual(
      Object.values(CARD_RARITY),
    )
  })

  it("should put each card in the pool of its rarity", () => {
    expect(
      pools.find(({ rarity }) => rarity === CARD_RARITY.LEGENDARY)?.pool,
    ).toEqual({ maps: [LEGENDARY_ENTRY] })
  })

  it("should leave the maps without card properties out", () => {
    expect(pools.flatMap(({ pool }) => pool.maps)).toEqual([
      COMMON_ENTRY,
      LEGENDARY_ENTRY,
    ])
  })

  it("should keep an empty pool for a rarity without cards", () => {
    expect(
      pools.find(({ rarity }) => rarity === CARD_RARITY.RARE)?.pool,
    ).toEqual({ maps: [] })
  })
})
