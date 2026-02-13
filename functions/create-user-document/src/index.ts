import { generateUsername } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { userDocSchema } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions"
import { beforeUserCreated, HttpsError } from "firebase-functions/identity"

export const createUserDocument: ReturnType<typeof beforeUserCreated> =
  beforeUserCreated(async (event) => {
    if (!event.data) {
      throw new HttpsError("invalid-argument", "Event data is required")
    }

    const user = event.data

    const email = user.email || `anonymous-${user.uid}@demo.geogamer`

    logger.info(
      `Creating user document for uid: ${user.uid} email: ${email}`,
    )
    try {
      const now = Timestamp.now()
      const pseudo = user?.displayName || generateUsername()
      const userDoc = userDocSchema.parse({
        email,
        createdAt: now,
        photoUrl: user.photoURL || null,
        updatedAt: now,
        pseudo,
      })

      await refs.users.doc(user.uid).set(userDoc)
    } catch (error) {
      logger.error("Error creating user document:", error)

      throw new HttpsError("internal", "Failed to create user document")
    }
  })
