import z from "zod"
import { dailyChallengeDateSchema } from "~/firestore/daily-challenge"

export const payloadCreateDailyChallengeSchema = z.object({
  date: dailyChallengeDateSchema.optional(),
})

export type PayloadCreateDailyChallenge = z.infer<typeof payloadCreateDailyChallengeSchema>
