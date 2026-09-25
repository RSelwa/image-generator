import { Timestamp } from "@firebase/firestore"
import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { describe, expect, it } from "vitest"
import { cardDocSchema, cardDocWithIdSchema } from "~/firestore/card"

const CARD_NUMBER = 42

const UNKNOWN_CARD_TYPE = "spell"

const UNKNOWN_RARITY = "mythic"

const CREATED_AT = Timestamp.now()

const MAP_CARD = {
  type: CARD_TYPE.MAP,
  gameId: "pokemon-red",
  mapId: "kanto",
  rarity: CARD_RARITY.RARE,
  number: CARD_NUMBER,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
}

const { mapId: _mapId, ...GAME_CARD_FIELDS } = MAP_CARD

const GAME_CARD = { ...GAME_CARD_FIELDS, type: CARD_TYPE.GAME }

describe("when the map card has every field", () => {
  it("should keep them", () => {
    expect(cardDocSchema.parse(MAP_CARD)).toEqual(MAP_CARD)
  })
})

describe("when the map card has no timestamps", () => {
  it("should default them to null", () => {
    const { createdAt: _, updatedAt: __, ...card } = MAP_CARD

    expect(cardDocSchema.parse(card)).toEqual({
      ...card,
      createdAt: null,
      updatedAt: null,
    })
  })
})

describe("when the map card has no map id", () => {
  it("should reject it", () => {
    const { mapId: _, ...card } = MAP_CARD

    expect(cardDocSchema.safeParse(card).success).toBe(false)
  })
})

describe("when the game card has every field", () => {
  it("should keep them", () => {
    expect(cardDocSchema.parse(GAME_CARD)).toEqual(GAME_CARD)
  })
})

describe("when the game card has a map id", () => {
  it("should drop it", () => {
    expect(cardDocSchema.parse({ ...GAME_CARD, mapId: "kanto" })).toEqual(
      GAME_CARD,
    )
  })
})

describe("when the game card has no game id", () => {
  it("should reject it", () => {
    const { gameId: _, ...card } = GAME_CARD

    expect(cardDocSchema.safeParse(card).success).toBe(false)
  })
})

describe("when the card type is unknown", () => {
  it("should reject it", () => {
    expect(
      cardDocSchema.safeParse({ ...MAP_CARD, type: UNKNOWN_CARD_TYPE }).success,
    ).toBe(false)
  })
})

describe("when the card fields are invalid", () => {
  it.each([
    { rarity: UNKNOWN_RARITY },
    { number: 0 },
    { number: 1.5 },
    { number: undefined },
  ])("should reject %o", (fields) => {
    expect(cardDocSchema.safeParse({ ...MAP_CARD, ...fields }).success).toBe(
      false,
    )
  })
})

describe("when the map card has an id", () => {
  it("should keep it", () => {
    expect(cardDocWithIdSchema.parse({ ...MAP_CARD, id: "card" })).toEqual({
      ...MAP_CARD,
      id: "card",
    })
  })
})

describe("when the game card has an id", () => {
  it("should keep it", () => {
    expect(cardDocWithIdSchema.parse({ ...GAME_CARD, id: "card" })).toEqual({
      ...GAME_CARD,
      id: "card",
    })
  })
})
