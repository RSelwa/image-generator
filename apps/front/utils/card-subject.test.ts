import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { type CardDoc } from "@repo/schemas"
import { describe, expect, it, vi } from "vitest"
import { getCardSubject } from "@/utils/card-subject"

vi.mock("@repo/providers/db-refs", () => ({ refs: {}, subRefs: {} }))

const CARD_PROPERTIES = { rarity: CARD_RARITY.RARE, number: 1 }

const MAP_CARD = {
  type: CARD_TYPE.MAP,
  gameId: "pokemon-red",
  mapId: "kanto",
  cardProperties: CARD_PROPERTIES,
  createdAt: null,
  updatedAt: null,
} satisfies CardDoc

const GAME_CARD = {
  type: CARD_TYPE.GAME,
  gameId: "pokemon-red",
  cardProperties: CARD_PROPERTIES,
  createdAt: null,
  updatedAt: null,
} satisfies CardDoc

describe("when the card is a map card", () => {
  it("should read the map name and image", () => {
    expect(
      getCardSubject(MAP_CARD, {
        name: "Kanto",
        imageUrl: "kanto.png",
        gameId: MAP_CARD.gameId,
      }),
    ).toEqual({ name: "Kanto", imageUrl: "kanto.png" })
  })
})

describe("when the card is a game card", () => {
  it("should read the game title and image", () => {
    expect(
      getCardSubject(GAME_CARD, { title: "Pokémon Red", image: "red.png" }),
    ).toEqual({ name: "Pokémon Red", imageUrl: "red.png" })
  })

  it("should fall back to no image", () => {
    expect(getCardSubject(GAME_CARD, { title: "Pokémon Red" })).toEqual({
      name: "Pokémon Red",
      imageUrl: null,
    })
  })
})

describe("when the card's map or game is gone", () => {
  it.each([MAP_CARD, GAME_CARD])("should return nothing for %o", (card) => {
    expect(getCardSubject(card, undefined)).toBeUndefined()
  })
})
