import z from "zod"

import { mapPositionSchema } from "~/firestore/spherical"
import { timestampSchema, WITH_ID } from "~/zod"

// Subcollection: users/{uid}/dailyChallengeResults/{date}
export const dailyChallengeResultDocSchema = z.object({
  date: z.string(), // YYYY-MM-DD = doc ID

  answer: z.string(),
  isCorrect: z.boolean(),

  // Map position guess (only if the challenge had a map)
  position: mapPositionSchema.nullish().default(null),

  completedAt: timestampSchema.nullish().default(() => null),
})

export const dailyChallengeResultDocWithIdSchema = dailyChallengeResultDocSchema.merge(WITH_ID)

export type DailyChallengeResultDoc = z.infer<typeof dailyChallengeResultDocSchema>
export type DailyChallengeResultDocWithId = z.infer<typeof dailyChallengeResultDocWithIdSchema>
