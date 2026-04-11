import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const deathRunAnswerSchema = z.object({
  roundIndex: z.number().min(0),
  gameId: z.string().min(1),
  answer: z.string().nullish().default(null),
  isCorrect: z.boolean().default(false),
  answeredAt: timestampSchema.nullish().default(null),
})

export const deathRunRunDocSchema = z.object({
  uid: z.string().min(1),
  score: z.number().default(0),
  currentRoundIndex: z.number().min(0).default(0),
  answers: z.array(deathRunAnswerSchema).default([]),
  livesRemaining: z.number().min(0).default(0),
  revivesUsed: z.number().min(0).default(0),
  startedAt: timestampSchema.nullish().default(null),
  finishedAt: timestampSchema.nullish().default(null),
})

export const deathRunRunDocWithIdSchema = z.object({ ...deathRunRunDocSchema.shape, ...WITH_ID.shape })

export type DeathRunAnswer = z.infer<typeof deathRunAnswerSchema>
export type DeathRunRunDoc = z.infer<typeof deathRunRunDocSchema>
export type DeathRunRunDocWithId = z.infer<typeof deathRunRunDocWithIdSchema>
