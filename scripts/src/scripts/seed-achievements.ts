import { ACHIEVEMENT_DIFFICULTY, ACHIEVEMENT_KEYS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type AchievementDoc, achievementDocSchema } from "@repo/schemas"

const ACHIEVEMENTS: AchievementDoc[] = [
  {
    key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
    name: "New identity",
    description: "Change your username",
    reward: 50,
    difficulty: ACHIEVEMENT_DIFFICULTY.EASY,
  },
]

for (const achievement of ACHIEVEMENTS) {
  const ref = refs[TABLES.ACHIEVEMENTS].doc(achievement.key)
  const snapshot = await ref.get()

  if (snapshot.exists) {
    console.info(`Achievement ${achievement.key} already exists, skipped`)
    continue
  }

  await ref.set(achievementDocSchema.parse(achievement))
  console.info(`Achievement ${achievement.key} created`)
}
