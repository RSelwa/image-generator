import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import {
  createMapInputSchema,
  mapDocSchema,
  updateMapInputSchema,
} from "~/firestore/map"

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
          cardProperties: { rarity: CARD_RARITY.LEGENDARY },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.LEGENDARY })
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
          cardProperties: { rarity: CARD_RARITY.COMMON },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.COMMON })
    })
  })
})

describe("updateMapInputSchema", () => {
  describe("when only the card properties are updated", () => {
    it("should accept them", () => {
      expect(
        updateMapInputSchema.parse({
          cardProperties: { rarity: CARD_RARITY.ULTRA_RARE },
        }).cardProperties,
      ).toEqual({ rarity: CARD_RARITY.ULTRA_RARE })
    })
  })
})
