import { DEATH_RUN_LIVES, DEATH_RUN_STATUS } from "@repo/common"
import z from "zod"
import { playerSchema } from "~/firestore/players"
import { timestampSchema, WITH_ID } from "~/zod"

export const deathRunDocSchema = z.object({
  code: z.string().min(4).max(6),
  hostId: z.string().min(1),
  seedId: z.string().min(1).nullish().default(() => null),
  status: z.enum(DEATH_RUN_STATUS),
  players: z.array(playerSchema).default([]),
  playersIds: z.array(z.string()).default([]),
  lives: z.number().positive().default(DEATH_RUN_LIVES),
  startedAt: timestampSchema.nullish().default(() => null),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const deathRunDocWithIdSchema = z.object({ ...deathRunDocSchema.shape, ...WITH_ID.shape })

export type DeathRunDoc = z.infer<typeof deathRunDocSchema>
export type DeathRunDocWithId = z.infer<typeof deathRunDocWithIdSchema>
