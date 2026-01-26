import { region } from "@repo/providers/config"
import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { https, logger } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"

type Payload = { boardId: string }

export const deleteBoardById = https.onCall<Payload>(
  { region: region as string, cors: "*" },
  async ({ auth, data }) => {
    try {
      if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      if (!data.boardId) {
        throw new HttpsError("invalid-argument", "boardId is required")
      }

      const ref = refs.boards.doc(data.boardId)

      const boardSnapshot = await ref.get()

      if (!boardSnapshot.exists) {
        throw new HttpsError("not-found", "Board not found")
      }

      const boardData = boardSnapshot.data()

      if (!boardData) {
        throw new HttpsError("not-found", "Board data is undefined")
      }

      if (boardData.ownerId !== auth.uid) {
        throw new HttpsError(
          "permission-denied",
          "User does not have permission to delete this board",
        )
      }

      await db.recursiveDelete(ref)

      logger.info(`User ${auth?.uid} deleted document at path ${ref?.path}`)

      return {}
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      }

      new HttpsError("cancelled", "Request was cancelled")
    }
  },
)
