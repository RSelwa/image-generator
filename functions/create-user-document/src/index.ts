import { generateUsername, getRandomAvatar, PREFIX_ANONYMOUS_USER, SUFFIX_ANONYMOUS_USER } from "@repo/common"
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

    const email = user.email || `${PREFIX_ANONYMOUS_USER}${user.uid}${SUFFIX_ANONYMOUS_USER}`

    logger.info(
      `Creating user document for uid: ${user.uid} email: ${email}`,
    )
    try {
      const now = Timestamp.now()
      const pseudo = user?.displayName || generateUsername()
      const userDoc = userDocSchema.parse({
        email,
        createdAt: now,
        updatedAt: now,
        pseudo,
        isAnonymousUser: Boolean(!user.email),
        avatar: getRandomAvatar(),
        newsletter: true,
      })

      await refs.users.doc(user.uid).set(userDoc)
    } catch (error) {
      logger.error("Error creating user document:", error)

      throw new HttpsError("internal", "Failed to create user document")
    }
  })
