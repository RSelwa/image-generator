import { region } from "@repo/providers/firebase"
import { https, logger } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"

type Payload = { boardId: string }

export const createPartyDoc = https.onCall<Payload>(
  { region: region as string, cors: "*" },
  async ({ auth, data }) => {
    try {
      if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      logger.info("Hello from createPartyDoc", { auth, data })

      return {}
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      }

      throw new HttpsError("cancelled", "Request was cancelled")
    }
  },
)
