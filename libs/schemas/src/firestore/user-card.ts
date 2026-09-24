import { z } from "zod"
import { cardPoolEntrySchema } from "~/firestore/card-pool"
import { cardPropertiesSchema } from "~/firestore/card-properties"
import { timestampSchema } from "~/zod"

export const userCardDocSchema = z.object({
  ...cardPoolEntrySchema.shape,
  count: z.number().int().positive(),
  cardPropertiesAtPull: cardPropertiesSchema,
  firstPulledAt: timestampSchema,
  lastPulledAt: timestampSchema,
})

export type UserCardDoc = z.infer<typeof userCardDocSchema>
