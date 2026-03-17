import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const raceAnswerSchema = z.object({
  roundIndex: z.number().min(0),
  gameId: z.string().min(1),
  timeMs: z.number().min(0),
  answeredAt: timestampSchema.nullish().default(() => null),
})

export const raceRunDocSchema = z.object({
  uid: z.string().min(1),
  score: z.number().default(0),
  currentRoundIndex: z.number().min(0).default(0),
  answers: z.array(raceAnswerSchema).default([]),
  startedAt: timestampSchema.nullish().default(() => null),
  finishedAt: timestampSchema.nullish().default(() => null),
})

export const raceRunDocWithIdSchema = z.object({ ...raceRunDocSchema.shape, ...WITH_ID.shape })

export type RaceAnswer = z.infer<typeof raceAnswerSchema>
export type RaceRunDoc = z.infer<typeof raceRunDocSchema>
export type RaceRunDocWithId = z.infer<typeof raceRunDocWithIdSchema>
