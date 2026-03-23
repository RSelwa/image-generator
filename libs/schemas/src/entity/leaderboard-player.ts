import { AVATARS_KEYS } from "@repo/common"
import z from "zod"
import { donorTierSchema } from "~/firestore"
import { WITH_ID } from "~/zod"

const leaderboardPlayerBaseSchema = z.object({
  ...WITH_ID.shape,
  pseudo: z.string().nullish(),
  avatar: z.enum(AVATARS_KEYS).nullish(),
  donorTier: z.object(donorTierSchema).shape.nullish().default(null),
})

export const streakLeaderboardPlayerSchema = leaderboardPlayerBaseSchema.extend({
  maxStreak: z.number().nullish(),
})

export const raceLeaderboardPlayerSchema = leaderboardPlayerBaseSchema.extend({
  bestRaceScore: z.number().nullish(),
})

export type StreakLeaderboardPlayer = z.infer<typeof streakLeaderboardPlayerSchema>
export type RaceLeaderboardPlayer = z.infer<typeof raceLeaderboardPlayerSchema>
