import { RACE_STATUS } from "@repo/common"
import z from "zod"
import { playerSchema } from "~/firestore/players"
import { timestampSchema, WITH_ID } from "~/zod"

export const raceDocSchema = z.object({
  code: z.string().min(4).max(6),
  hostId: z.string().min(1),
  seedId: z.string().min(1),
  status: z.enum(RACE_STATUS),
  players: z.array(playerSchema).default([]),
  playersIds: z.array(z.string()).default([]),
  duration: z.number().positive(),
  startedAt: timestampSchema.nullish().default(() => null),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const raceDocWithIdSchema = z.object({ ...raceDocSchema.shape, ...WITH_ID.shape })

export const createRaceInputSchema = raceDocSchema.omit({ createdAt: true, updatedAt: true, startedAt: true })
export const updateRaceInputSchema = createRaceInputSchema.partial()

export type RaceDoc = z.infer<typeof raceDocSchema>
export type RaceDocWithId = z.infer<typeof raceDocWithIdSchema>
export type CreateRaceInput = z.infer<typeof createRaceInputSchema>
export type UpdateRaceInput = z.infer<typeof updateRaceInputSchema>
