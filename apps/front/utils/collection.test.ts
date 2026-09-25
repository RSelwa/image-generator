import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { type CardRarity } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { buildCollectionBinder } from "@/utils/collection"

const buildCard = (
  mapId: string,
  gameId: string,
  rarity: CardRarity,
  number: number,
) => ({
  cardId: `${mapId}-card`,
  type: CARD_TYPE.MAP,
  gameId,
  name: mapId,
  imageUrl: null,
  rarity,
  number,
})

const HYRULE = buildCard("hyrule", "zelda", CARD_RARITY.RARE, 1)
const KANTO = buildCard("kanto", "pokemon", CARD_RARITY.COMMON, 2)
const JOHTO = buildCard("johto", "pokemon", CARD_RARITY.LEGENDARY, 3)
const GAME_TITLES = { pokemon: "Pokémon", zelda: "Zelda" }

const binder = buildCollectionBinder([JOHTO, KANTO, HYRULE], GAME_TITLES, {
  [KANTO.cardId]: 3,
  [HYRULE.cardId]: 1,
})

describe("when the collection binder is built", () => {
  it("should count the owned cards out of every card", () => {
    expect(binder).toMatchObject({ ownedCount: 2, total: 3 })
  })

  it("should order the games by their first card number", () => {
    expect(binder.groups.map(({ gameTitle }) => gameTitle)).toEqual([
      "Zelda",
      "Pokémon",
    ])
  })

  it("should order each game's cards by number", () => {
    expect(binder.groups[1]?.cards.map(({ number }) => number)).toEqual([2, 3])
  })

  it("should count the owned cards of each game", () => {
    expect(binder.groups.map(({ ownedCount }) => ownedCount)).toEqual([1, 1])
  })

  it("should carry the owned count on each card", () => {
    expect(binder.groups[1]?.cards.map(({ count }) => count)).toEqual([3, 0])
  })
})

describe("when a game has no title", () => {
  it("should fall back to its id", () => {
    expect(
      buildCollectionBinder([HYRULE], {}, {}).groups.map(
        ({ gameTitle }) => gameTitle,
      ),
    ).toEqual(["zelda"])
  })
})

describe("when a game has a game card", () => {
  it("should show it first in its game", () => {
    const pokemonCard = {
      ...buildCard("pokemon", "pokemon", CARD_RARITY.RARE, 4),
      type: CARD_TYPE.GAME,
    }

    expect(
      buildCollectionBinder(
        [JOHTO, pokemonCard, KANTO],
        GAME_TITLES,
        {},
      ).groups[0]?.cards.map(({ cardId }) => cardId),
    ).toEqual([pokemonCard.cardId, KANTO.cardId, JOHTO.cardId])
  })
})
