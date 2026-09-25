import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { mapDocSchema } from "~/firestore/map"

const CARD_NUMBER = 42

const MAP = {
  name: "Kanto",
  gameId: "pokemon-red",
}

describe("when a map still carries card properties", () => {
  it("should drop them", () => {
    expect(
      mapDocSchema.parse({
        ...MAP,
        cardProperties: { rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER },
      }),
    ).not.toHaveProperty("cardProperties")
  })
})
