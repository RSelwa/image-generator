import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import {
  createMapInputSchema,
  mapDocSchema,
  updateMapInputSchema,
} from "~/firestore/map"

const CARD_NUMBER = 42

const MAP = {
  name: "Kanto",
  gameId: "pokemon-red",
}

describe("mapDocSchema", () => {
  describe("when the map has card properties", () => {
    it("should keep them", () => {
      expect(
        mapDocSchema.parse({
          ...MAP,
          cardProperties: {
            rarity: CARD_RARITY.LEGENDARY,
            number: CARD_NUMBER,
          },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER })
    })
  })

  describe("when the map has no card properties", () => {
    it("should leave them unset", () => {
      expect(mapDocSchema.parse(MAP)).not.toHaveProperty("cardProperties")
    })
  })

  describe("when the card properties have no rarity", () => {
    it("should reject them", () => {
      expect(
        mapDocSchema.safeParse({ ...MAP, cardProperties: {} }).success,
      ).toBe(false)
    })
  })

  describe("when the card properties have no number", () => {
    it("should reject them", () => {
      expect(
        mapDocSchema.safeParse({
          ...MAP,
          cardProperties: { rarity: CARD_RARITY.RARE },
        }).success,
      ).toBe(false)
    })
  })

  describe("when the card number is not a positive integer", () => {
    it.each([0, 1.5])("should reject %s", (number) => {
      expect(
        mapDocSchema.safeParse({
          ...MAP,
          cardProperties: { rarity: CARD_RARITY.RARE, number },
        }).success,
      ).toBe(false)
    })
  })

  describe("when the rarity is unknown", () => {
    it("should reject it", () => {
      expect(
        mapDocSchema.safeParse({ ...MAP, cardProperties: { rarity: "mythic" } })
          .success,
      ).toBe(false)
    })
  })
})

describe("createMapInputSchema", () => {
  describe("when the input has card properties", () => {
    it("should keep them", () => {
      expect(
        createMapInputSchema.parse({
          ...MAP,
          cardProperties: { rarity: CARD_RARITY.COMMON, number: CARD_NUMBER },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.COMMON, number: CARD_NUMBER })
    })
  })
})

describe("updateMapInputSchema", () => {
  describe("when only the card properties are updated", () => {
    it("should accept them", () => {
      expect(
        updateMapInputSchema.parse({
          cardProperties: {
            rarity: CARD_RARITY.ULTRA_RARE,
            number: CARD_NUMBER,
          },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.ULTRA_RARE, number: CARD_NUMBER })
    })
  })
})
