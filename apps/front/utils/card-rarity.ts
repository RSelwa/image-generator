import { CARD_TYPE } from "@repo/common"
import { type CardDoc, type CardRarity, type MapDocWithId } from "@repo/schemas"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import { type CardRarityFilter } from "@/schemas/card-rarity-filter"

export const getCardRarityByMapId = (cards: CardDoc[]) =>
  new Map(
    cards.flatMap((card) => {
      if (card.type !== CARD_TYPE.MAP) return []

      return [[card.mapId, card.cardProperties.rarity] as const]
    }),
  )

export const filterMapsByCardRarity = (
  maps: MapDocWithId[],
  rarityByMapId: Map<string, CardRarity>,
  filter: CardRarityFilter,
) => {
  if (filter === CARD_RARITY_FILTER.ALL) return maps

  if (filter === CARD_RARITY_FILTER.NOT_RATED) {
    return maps.filter(({ id }) => !rarityByMapId.has(id))
  }

  return maps.filter(({ id }) => rarityByMapId.get(id) === filter)
}

export const countMapsByCardRarity = (
  maps: MapDocWithId[],
  rarityByMapId: Map<string, CardRarity>,
  options: { value: CardRarityFilter; label: string }[],
) =>
  options.map((option) => ({
    ...option,
    count: filterMapsByCardRarity(maps, rarityByMapId, option.value).length,
  }))
