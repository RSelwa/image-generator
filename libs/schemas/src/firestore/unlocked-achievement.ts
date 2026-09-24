import { z } from "zod"
import {
  achievementDocSchema,
  achievementSchema,
} from "~/firestore/achievement"
import { timestampSchema } from "~/zod"

export const unlockedAchievementDocSchema = z.object({
  key: achievementSchema.shape.key,
  achievedAt: timestampSchema,
  reward: achievementDocSchema.shape.reward,
})

export type UnlockedAchievementDoc = z.infer<
  typeof unlockedAchievementDocSchema
>
