import { TABLES, USER_RIGHT } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { region } from "@repo/providers/firebase"
import { payloadCreateDailyChallengeSchema } from "@repo/schemas"
import { https } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"
import { onSchedule } from "firebase-functions/scheduler"
import { type z } from "zod"
import { createDailyChallenge } from "~/create-daily-challenge"

export const schedule_daily_challenge = onSchedule("0 0 * * *", async () => {
  await createDailyChallenge()
})

export const create_daily_challenge = https.onCall <
  z.infer<typeof payloadCreateDailyChallengeSchema>
>({ region: region as string, cors: "*" }, async ({ auth, data }) => {
  try {
    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const rights = await refs[TABLES.RIGHTS].doc(auth.uid).get()

    if (!rights.exists || rights.data()?.right !== USER_RIGHT.ADMIN) {
      throw new HttpsError("permission-denied", "User must be an admin to call this function")
    }

    const parsedData = payloadCreateDailyChallengeSchema.safeParse(data)

    if (!parsedData.success) {
      throw new HttpsError("invalid-argument", "Invalid payload")
    }

    const date = parsedData.data.date

    const challengeWithDate = await createDailyChallenge(date)

    if (!challengeWithDate) throw new HttpsError("internal", "Failed to create daily challenge")

    return { dailyChallenge: challengeWithDate }
  } catch (error) {
    console.error(error)

    if (error instanceof HttpsError) {
      throw error
    }

    if (error instanceof Error) {
      throw new HttpsError("internal", error.message)
    }

    throw new HttpsError("cancelled", "Request was cancelled")
  }
})
