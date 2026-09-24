import { ACHIEVEMENT_KEYS } from "@repo/common"
import { z } from "zod"
import { userDocSchema } from "~/firestore/user"

const userChangeDataSchema = userDocSchema.pick({ pseudo: true })

export const achievementEventSchema = z.discriminatedUnion("key", [
  z.strictObject({
    key: z.literal(ACHIEVEMENT_KEYS.CHANGE_USERNAME),
    before: userChangeDataSchema,
    after: userChangeDataSchema,
  }),
])

export type AchievementEvent = z.infer<typeof achievementEventSchema>
