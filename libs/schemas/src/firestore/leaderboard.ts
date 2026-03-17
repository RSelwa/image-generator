import { AVATARS_KEYS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const leaderboardDocSchema = z.object({
  uid: z.string().min(1),
  pseudo: z.string(),
  avatar: z.enum(AVATARS_KEYS),
  score: z.number().min(0),
  roundsCompleted: z.number().min(0),
  seedId: z.string().min(1),
  seedName: z.string(),
  raceId: z.string().min(1),
  finishedAt: timestampSchema.nullish().default(() => null),
})

export const leaderboardDocWithIdSchema = z.object({ ...leaderboardDocSchema.shape, ...WITH_ID.shape })

export type LeaderboardDoc = z.infer<typeof leaderboardDocSchema>
export type LeaderboardDocWithId = z.infer<typeof leaderboardDocWithIdSchema>
