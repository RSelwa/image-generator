import { ACHIEVEMENT_DIFFICULTY } from "@repo/common"
import { z } from "zod"

export const achievementDifficultySchema = z.enum(ACHIEVEMENT_DIFFICULTY)

export const achievementDocSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  reward: z.number().int().nonnegative(),
  difficulty: achievementDifficultySchema.optional(),
  goalToAchieve: z.number().int().positive().optional(),
})

export const achievementSchema = achievementDocSchema.extend({
  key: z.string().min(1),
})

export type AchievementDoc = z.infer<typeof achievementDocSchema>
export type Achievement = z.infer<typeof achievementSchema>
