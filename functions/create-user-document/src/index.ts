import { refs } from "@repo/providers/db-refs"
import { userDocSchema } from "@repo/schemas"
import { logger } from "firebase-functions"
import { beforeUserCreated, HttpsError } from "firebase-functions/identity"

export const createUserDocument: ReturnType<typeof beforeUserCreated> =
  beforeUserCreated(async (event) => {
    if (!event.data) {
      throw new HttpsError("invalid-argument", "Event data is required")
    }

    const user = event.data

    if (!user.email) {
      logger.error("User email is required")
      throw new HttpsError("invalid-argument", "User email is required")
    }

    logger.info(
      `Creating user document for uid: ${user.uid} email: ${user.email}`,
    )

    const userDoc = userDocSchema.parse({ email: user.email })

    try {
      await refs.users.doc(user.uid).set(userDoc)
    } catch (error) {
      logger.error("Error creating user document:", error)

      throw new HttpsError("internal", "Failed to create user document")
    }
  })
