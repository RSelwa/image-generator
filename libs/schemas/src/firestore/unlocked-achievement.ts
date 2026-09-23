import { z } from "zod"
import { achievementDocSchema } from "~/firestore/achievement"
import { timestampSchema } from "~/zod"

export const unlockedAchievementDocSchema = z.object({
  achievedAt: timestampSchema,
  reward: achievementDocSchema.shape.reward,
})

export type UnlockedAchievementDoc = z.infer<
  typeof unlockedAchievementDocSchema
>
