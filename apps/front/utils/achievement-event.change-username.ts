import { type AchievementEvent, type UserDoc } from "@repo/schemas"

export const isUsernameChanged = (
  { before, after }: AchievementEvent,
  user: Pick<UserDoc, "pseudo">,
) => before.pseudo !== after.pseudo && user.pseudo === after.pseudo
