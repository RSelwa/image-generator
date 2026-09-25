import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import { z } from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const cardRaritySchema = z.enum(CARD_RARITY)

export const cardFieldsSchema = z.object({
  rarity: cardRaritySchema,
  number: z.number().int().positive(),
})

const cardDocBaseSchema = cardFieldsSchema.extend({
  gameId: z.string().min(1),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const cardDocSchema = z.discriminatedUnion("type", [
  cardDocBaseSchema.extend({
    type: z.literal(CARD_TYPE.MAP),
    mapId: z.string().min(1),
  }),
  cardDocBaseSchema.extend({
    type: z.literal(CARD_TYPE.GAME),
  }),
])

export const cardDocWithIdSchema = cardDocSchema.and(WITH_ID)

export type CardRarity = z.infer<typeof cardRaritySchema>
export type CardFields = z.infer<typeof cardFieldsSchema>
export type CardDoc = z.infer<typeof cardDocSchema>
export type CardDocWithId = z.infer<typeof cardDocWithIdSchema>
