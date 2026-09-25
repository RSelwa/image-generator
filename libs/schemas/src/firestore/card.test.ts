import { Timestamp } from "@firebase/firestore"
import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { describe, expect, it } from "vitest"
import { cardDocSchema } from "~/firestore/card"

const CARD_NUMBER = 42

const UNKNOWN_CARD_TYPE = "spell"

const UNKNOWN_RARITY = "mythic"

const CREATED_AT = Timestamp.now()

const MAP_CARD = {
  type: CARD_TYPE.MAP,
  gameId: "pokemon-red",
  mapId: "kanto",
  cardProperties: { rarity: CARD_RARITY.RARE, number: CARD_NUMBER },
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
}

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

describe("when the card type is unknown", () => {
  it("should reject it", () => {
    expect(
      cardDocSchema.safeParse({ ...MAP_CARD, type: UNKNOWN_CARD_TYPE }).success,
    ).toBe(false)
  })
})

describe("when the card properties are invalid", () => {
  it.each([
    { rarity: UNKNOWN_RARITY, number: CARD_NUMBER },
    { rarity: CARD_RARITY.RARE, number: 0 },
    { rarity: CARD_RARITY.RARE },
  ])("should reject %o", (cardProperties) => {
    expect(
      cardDocSchema.safeParse({ ...MAP_CARD, cardProperties }).success,
    ).toBe(false)
  })
})
