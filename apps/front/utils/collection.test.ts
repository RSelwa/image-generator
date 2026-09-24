import { CARD_RARITY } from "@repo/common"
import { type CardRarity } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { buildCollectionGroups } from "@/utils/collection"

const buildCard = (mapId: string, gameId: string, rarity: CardRarity) => ({
  mapId,
  gameId,
  name: mapId,
  imageUrl: null,
  rarity,
})

const KANTO = buildCard("kanto", "pokemon", CARD_RARITY.COMMON)
const JOHTO = buildCard("johto", "pokemon", CARD_RARITY.LEGENDARY)
const HYRULE = buildCard("hyrule", "zelda", CARD_RARITY.RARE)
const GAME_TITLES = { pokemon: "Pokémon", zelda: "Zelda" }

const groups = buildCollectionGroups([KANTO, HYRULE, JOHTO], GAME_TITLES, {
  kanto: 3,
})

describe("when the collection is grouped", () => {
  it("should make one group per game sorted by title", () => {
    expect(groups.map(({ gameTitle }) => gameTitle)).toEqual([
      "Pokémon",
      "Zelda",
    ])
  })

  it("should put the rarest cards first", () => {
    expect(groups[0]?.cards.map(({ mapId }) => mapId)).toEqual([
      "johto",
      "kanto",
    ])
  })

  it("should count the owned cards of each game", () => {
    expect(groups.map(({ ownedCount }) => ownedCount)).toEqual([1, 0])
  })

  it("should carry the owned count on each card", () => {
    expect(groups[0]?.cards.map(({ count }) => count)).toEqual([0, 3])
  })
})

describe("when a game has no title", () => {
  it("should fall back to its id", () => {
    expect(
      buildCollectionGroups([HYRULE], {}, {}).map(({ gameTitle }) => gameTitle),
    ).toEqual(["zelda"])
  })
})
