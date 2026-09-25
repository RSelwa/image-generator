import { CARD_TYPE } from "@repo/common"
import { z } from "zod"
import { cardPropertiesSchema } from "~/firestore/card-properties"
import { timestampSchema, WITH_ID } from "~/zod"

export const cardDocSchema = z.object({
  type: z.literal(CARD_TYPE.MAP),
  gameId: z.string().min(1),
  mapId: z.string().min(1),
  cardProperties: cardPropertiesSchema,
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const cardDocWithIdSchema = z.object({
  ...cardDocSchema.shape,
  ...WITH_ID.shape,
})

export type CardDoc = z.infer<typeof cardDocSchema>
export type CardDocWithId = z.infer<typeof cardDocWithIdSchema>
