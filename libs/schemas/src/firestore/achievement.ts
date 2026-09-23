import { ACHIEVEMENT_DIFFICULTY } from "@repo/common"
import { z } from "zod"

export const achievementDifficultySchema = z.enum(ACHIEVEMENT_DIFFICULTY)

export const achievementDocSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  reward: z.number().int().nonnegative(),
  difficulty: achievementDifficultySchema.optional(),
  goalToAchieve: z.number().int().positive().optional(),
})

export type AchievementDifficulty = z.infer<typeof achievementDifficultySchema>
export type AchievementDoc = z.infer<typeof achievementDocSchema>
