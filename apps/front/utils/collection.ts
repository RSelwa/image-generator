import { type CardRarity } from "@repo/schemas"

export type CollectionCard = {
  cardId: string
  mapId: string
  gameId: string
  name: string
  imageUrl: string | null
  rarity: CardRarity
  number: number
}

export const buildCollectionBinder = (
  cards: CollectionCard[],
  gameTitles: Record<string, string>,
  ownedCounts: Record<string, number>,
) => {
  const binderCards = cards
    .map((card) => ({ ...card, count: ownedCounts[card.cardId] || 0 }))
    .toSorted((first, second) => first.number - second.number)
  const gameIds = [...new Set(binderCards.map(({ gameId }) => gameId))]

  return {
    ownedCount: binderCards.filter(({ count }) => count > 0).length,
    total: binderCards.length,
    groups: gameIds.map((gameId) => {
      const gameCards = binderCards.filter((card) => card.gameId === gameId)

      return {
        gameId,
        gameTitle: gameTitles[gameId] || gameId,
        ownedCount: gameCards.filter(({ count }) => count > 0).length,
        cards: gameCards,
      }
    }),
  }
}
