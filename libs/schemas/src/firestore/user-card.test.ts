import { Timestamp } from "@firebase/firestore"
import { CARD_RARITY } from "@repo/common"
import { describe, expect, it } from "vitest"
import { userCardDocSchema } from "~/firestore/user-card"

const PULLED_AT = Timestamp.now()

const USER_CARD = {
  mapId: "kanto",
  gameId: "pokemon-red",
  count: 1,
  cardPropertiesAtPull: { rarity: CARD_RARITY.RARE },
  firstPulledAt: PULLED_AT,
  lastPulledAt: PULLED_AT,
}

describe("when the card has every field", () => {
  it("should keep them", () => {
    expect(userCardDocSchema.parse(USER_CARD)).toEqual(USER_CARD)
  })
})

describe("when the count is not a positive integer", () => {
  it.each([0, 1.5])("should reject %s", (count) => {
    expect(userCardDocSchema.safeParse({ ...USER_CARD, count }).success).toBe(
      false,
    )
  })
})

describe("when the card properties at pull are missing", () => {
  it("should reject the card", () => {
    const { cardPropertiesAtPull: _, ...card } = USER_CARD

    expect(userCardDocSchema.safeParse(card).success).toBe(false)
  })
})

describe("when the card has no pull date", () => {
  it("should reject it", () => {
    const { firstPulledAt: _, ...card } = USER_CARD

    expect(userCardDocSchema.safeParse(card).success).toBe(false)
  })
})
