import {
  CARD_RARITY,
  CARD_RARITY_WEIGHTS,
  GUARANTEED_CARD_RARITIES,
  PACK_SIZE,
} from "@repo/common"
import { type CardDocWithId, type CardRarity } from "@repo/schemas"

type Random = () => number

const RARITIES_BY_ORDER = Object.values(CARD_RARITY)

const pickWeightedRarity = (
  rarities: readonly CardRarity[],
  random: Random,
) => {
  const totalWeight = rarities.reduce(
    (total, rarity) => total + CARD_RARITY_WEIGHTS[rarity],
    0,
  )
  let threshold = random() * totalWeight

  for (const rarity of rarities) {
    threshold -= CARD_RARITY_WEIGHTS[rarity]
    if (threshold < 0) return rarity
  }

  return rarities[rarities.length - 1]
}

export const drawRarities = (random: Random) =>
  Array.from({ length: PACK_SIZE }, (_, slot) => {
    const isLastSlot = slot === PACK_SIZE - 1

    if (isLastSlot) return pickWeightedRarity(GUARANTEED_CARD_RARITIES, random)

    return pickWeightedRarity(RARITIES_BY_ORDER, random)
  })

export const pickCard = (
  pools: Record<CardRarity, CardDocWithId[]>,
  rarity: CardRarity,
  random: Random,
) => {
  const index = RARITIES_BY_ORDER.indexOf(rarity)
  const fallbackRarities = [
    ...RARITIES_BY_ORDER.slice(0, index + 1).toReversed(),
    ...RARITIES_BY_ORDER.slice(index + 1),
  ]
  const drawnRarity = fallbackRarities.find(
    (fallbackRarity) => pools[fallbackRarity].length > 0,
  )

  if (!drawnRarity) return null

  const pool = pools[drawnRarity]
  const card = pool[Math.floor(random() * pool.length)]

  return { rarity: drawnRarity, card }
}
