import { CARD_RARITY } from "@repo/common"
import { z } from "zod"

export const cardRaritySchema = z.enum(CARD_RARITY)

export const cardPropertiesSchema = z.object({
  rarity: cardRaritySchema,
  number: z.number().int().positive(),
})

export type CardRarity = z.infer<typeof cardRaritySchema>
export type CardProperties = z.infer<typeof cardPropertiesSchema>
