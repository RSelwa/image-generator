import { CARD_RARITY } from "@repo/common"
import { type CardRarity } from "@repo/schemas"

export type CollectionCard = {
  mapId: string
  gameId: string
  name: string
  imageUrl: string | null
  rarity: CardRarity
}

const RARITIES_BY_ORDER = Object.values(CARD_RARITY)

const getRarityRank = (rarity: CardRarity) => RARITIES_BY_ORDER.indexOf(rarity)

export const buildCollectionGroups = (
  cards: CollectionCard[],
  gameTitles: Record<string, string>,
  ownedCounts: Record<string, number>,
) => {
  const gameIds = [...new Set(cards.map(({ gameId }) => gameId))]

  return gameIds
    .map((gameId) => {
      const gameCards = cards
        .filter((card) => card.gameId === gameId)
        .map((card) => ({ ...card, count: ownedCounts[card.mapId] || 0 }))
        .toSorted(
          (first, second) =>
            getRarityRank(second.rarity) - getRarityRank(first.rarity),
        )

      return {
        gameId,
        gameTitle: gameTitles[gameId] || gameId,
        ownedCount: gameCards.filter(({ count }) => count > 0).length,
        cards: gameCards,
      }
    })
    .toSorted((first, second) =>
      first.gameTitle.localeCompare(second.gameTitle),
    )
}
