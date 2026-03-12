import z from "zod"

export const payloadCreateDailyChallengeSchema = z.object({
  date: z.date().optional(),
})
