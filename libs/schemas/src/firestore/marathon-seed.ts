import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const marathonSeedRoundSchema = z.object({
  gameId: z.string(),
  sphericalId: z.string().nullish().default(() => null),
  sphericalImageUrl: z.string().nullish().default(() => null),
  flatId: z.string().nullish().default(() => null),
  flatImageUrl: z.string().nullish().default(() => null),
})

export const marathonSeedDocSchema = z.object({
  name: z.string().min(1),
  rounds: z.array(marathonSeedRoundSchema).default([]),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const marathonSeedDocWithIdSchema = z.object({ ...marathonSeedDocSchema.shape, ...WITH_ID.shape })

export const createMarathonSeedInputSchema = marathonSeedDocSchema.omit({ createdAt: true, updatedAt: true })

export type MarathonSeedRound = z.infer<typeof marathonSeedRoundSchema>
export type MarathonSeedDoc = z.infer<typeof marathonSeedDocSchema>
export type MarathonSeedDocWithId = z.infer<typeof marathonSeedDocWithIdSchema>
export type CreateMarathonSeedInput = z.infer<typeof createMarathonSeedInputSchema>
