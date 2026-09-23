import { ACHIEVEMENT_KEYS } from "@repo/common"
import { type AchievementEvent } from "@repo/schemas"

type AchievementEventByKey = {
  [Event in AchievementEvent as Event["key"]]: Event
}

type AchievementEventKey = keyof AchievementEventByKey

const ACHIEVEMENT_EVENT_VERIFIERS: {
  [Key in AchievementEventKey]: (event: AchievementEventByKey[Key]) => boolean
} = {
  [ACHIEVEMENT_KEYS.CHANGE_USERNAME]: ({ before, after }) =>
    before.pseudo !== after.pseudo,
}

export const isAchievementEventVerified = <Key extends AchievementEventKey>(
  key: Key,
  event: AchievementEventByKey[Key],
) => ACHIEVEMENT_EVENT_VERIFIERS[key](event)
