import { cardRaritySchema } from "@repo/schemas"
import { z } from "zod"
import { CARD_RARITY_FILTER } from "@/constants/mapping"

export const cardRarityFilterSchema = z
  .union([cardRaritySchema, z.enum(CARD_RARITY_FILTER)])
  .catch(CARD_RARITY_FILTER.ALL)

export type CardRarityFilter = z.infer<typeof cardRarityFilterSchema>
