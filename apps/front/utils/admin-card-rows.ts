import { CARD_TYPE } from "@repo/common"
import {
  type CardDocWithId,
  type GameDocWithId,
  type MapDocWithId,
} from "@repo/schemas"
import { getCardNumberIssues } from "@/utils/card-number"

export const buildAdminCardRows = (
  cards: CardDocWithId[],
  games: Pick<GameDocWithId, "id" | "title">[],
  maps: Pick<MapDocWithId, "id" | "name">[],
) => {
  const gameTitleById = new Map(games.map(({ id, title }) => [id, title]))
  const mapNameById = new Map(maps.map(({ id, name }) => [id, name]))
  const duplicateNumbers = new Set(getCardNumberIssues(cards).duplicates)

  return cards
    .map((card) => {
      const gameTitle = gameTitleById.get(card.gameId) || null
      const name =
        card.type === CARD_TYPE.GAME
          ? gameTitle
          : mapNameById.get(card.mapId) || null

      return {
        card,
        gameTitle,
        name,
        isDuplicateNumber: duplicateNumbers.has(card.cardProperties.number),
      }
    })
    .toSorted(
      (first, second) =>
        first.card.cardProperties.number - second.card.cardProperties.number,
    )
}

export type AdminCardRow = ReturnType<typeof buildAdminCardRows>[number]
