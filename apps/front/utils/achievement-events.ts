import { ACHIEVEMENT_KEYS } from "@repo/common"
import { type AchievementEvent, type UserDoc } from "@repo/schemas"

type AchievementEventByKey = {
  [Event in AchievementEvent as Event["key"]]: Event
}

type AchievementEventKey = keyof AchievementEventByKey

type StoredUser = Pick<UserDoc, "pseudo">

const ACHIEVEMENT_EVENT_VERIFIERS: {
  [Key in AchievementEventKey]: (
    event: AchievementEventByKey[Key],
    user: StoredUser,
  ) => boolean
} = {
  [ACHIEVEMENT_KEYS.CHANGE_USERNAME]: ({ before, after }, user) =>
    before.pseudo !== after.pseudo && user.pseudo === after.pseudo,
}

export const isAchievementEventVerified = <Key extends AchievementEventKey>(
  key: Key,
  event: AchievementEventByKey[Key],
  user: StoredUser,
) => ACHIEVEMENT_EVENT_VERIFIERS[key](event, user)
