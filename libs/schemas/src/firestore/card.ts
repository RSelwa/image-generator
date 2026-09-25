import { CARD_TYPE } from "@repo/common"
import { z } from "zod"
import { cardPropertiesSchema } from "~/firestore/card-properties"
import { timestampSchema, WITH_ID } from "~/zod"

const cardDocBaseSchema = z.object({
  gameId: z.string().min(1),
  cardProperties: cardPropertiesSchema,
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

export type CardDoc = z.infer<typeof cardDocSchema>
export type CardDocWithId = z.infer<typeof cardDocWithIdSchema>
