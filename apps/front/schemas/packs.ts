import { cardPoolEntrySchema, cardPropertiesSchema } from "@repo/schemas"
import { z } from "zod"

export const openedCardSchema = z.object({
  ...cardPoolEntrySchema.shape,
  name: z.string(),
  imageUrl: z.string().nullable(),
  cardProperties: cardPropertiesSchema,
  isNew: z.boolean(),
})

export const openPackResponseSchema = z.object({
  cards: z.array(openedCardSchema),
  packsStored: z.number().int().nonnegative(),
  packsRefillAnchorMs: z.number(),
})

export type OpenedCard = z.infer<typeof openedCardSchema>
export type OpenPackResponse = z.infer<typeof openPackResponseSchema>
