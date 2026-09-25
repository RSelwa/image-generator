import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { type CardDocWithId } from "@repo/schemas"
import { describe, expect, it } from "vitest"
import { buildAdminCardRows } from "@/utils/admin-card-rows"

const buildMapCard = (id: string, mapId: string, number: number) =>
  ({
    id,
    type: CARD_TYPE.MAP,
    gameId: "pokemon",
    mapId,
    rarity: CARD_RARITY.COMMON,
    number,
    createdAt: null,
    updatedAt: null,
  }) satisfies CardDocWithId

const GAME_CARD = {
  id: "pokemon-card",
  type: CARD_TYPE.GAME,
  gameId: "pokemon",
  rarity: CARD_RARITY.LEGENDARY,
  number: 1,
  createdAt: null,
  updatedAt: null,
} satisfies CardDocWithId

const GAMES = [{ id: "pokemon", title: "Pokémon" }]
const MAPS = [
  { id: "kanto", name: "Kanto" },
  { id: "johto", name: "Johto" },
]

describe("buildAdminCardRows", () => {
  it("should sort the cards by number", () => {
    const rows = buildAdminCardRows(
      [buildMapCard("johto-card", "johto", 3), GAME_CARD],
      GAMES,
      MAPS,
    )

    expect(rows.map(({ card }) => card.id)).toEqual([
      "pokemon-card",
      "johto-card",
    ])
  })

  it("should name a game card after its game and a map card after its map", () => {
    const rows = buildAdminCardRows(
      [GAME_CARD, buildMapCard("kanto-card", "kanto", 2)],
      GAMES,
      MAPS,
    )

    expect(rows.map(({ name, gameTitle }) => ({ name, gameTitle }))).toEqual([
      { name: "Pokémon", gameTitle: "Pokémon" },
      { name: "Kanto", gameTitle: "Pokémon" },
    ])
  })

  it("should leave the name empty when the map is gone", () => {
    const [row] = buildAdminCardRows(
      [buildMapCard("gone-card", "gone", 2)],
      GAMES,
      MAPS,
    )

    expect(row?.name).toBeNull()
  })

  it("should flag the cards sharing a number", () => {
    const rows = buildAdminCardRows(
      [
        GAME_CARD,
        buildMapCard("kanto-card", "kanto", 2),
        buildMapCard("johto-card", "johto", 2),
      ],
      GAMES,
      MAPS,
    )

    expect(rows.map(({ isDuplicateNumber }) => isDuplicateNumber)).toEqual([
      false,
      true,
      true,
    ])
  })
})
