import { type MapDocWithId } from "@repo/schemas"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import { type CardRarityFilter } from "@/schemas/card-rarity-filter"

export const filterMapsByCardRarity = (
  maps: MapDocWithId[],
  filter: CardRarityFilter,
) => {
  if (filter === CARD_RARITY_FILTER.ALL) return maps

  if (filter === CARD_RARITY_FILTER.NOT_RATED) {
    return maps.filter(({ cardProperties }) => !cardProperties)
  }

  return maps.filter(({ cardProperties }) => cardProperties?.rarity === filter)
}

export const countMapsByCardRarity = (
  maps: MapDocWithId[],
  options: { value: CardRarityFilter; label: string }[],
) =>
  options.map((option) => ({
    ...option,
    count: filterMapsByCardRarity(maps, option.value).length,
  }))
