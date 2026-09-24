import { region } from "@repo/providers/config"
import { https, logger } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"

export const {{FUNCTION_NAME}} = https.onRequest(
  { region: region as string, cors: "*" },
  async (req, res) => {
    try {
      res.status(200).json({ })
    } catch (error) {
      logger.error(error)

      if (error instanceof HttpsError) throw error

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      }

      throw new HttpsError("cancelled", "Request was cancelled")
    }
  }
)
