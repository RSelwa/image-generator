import { z } from "zod"
import { timestampSchema } from "~/zod"

export const userCardDocSchema = z.object({
  cardId: z.string().min(1),
  gameId: z.string().min(1),
  count: z.number().int().positive(),
  firstPulledAt: timestampSchema,
  lastPulledAt: timestampSchema,
})

export type UserCardDoc = z.infer<typeof userCardDocSchema>
