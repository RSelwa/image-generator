import { onSchedule } from "firebase-functions/scheduler"
import { createDailyChallenge } from "~/create-daily-challenge"

export const schedule_daily_challenge = onSchedule("0 0 * * *", async () => {
  await createDailyChallenge()
})
