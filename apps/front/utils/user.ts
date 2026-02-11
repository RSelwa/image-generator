import { type RightDoc, type UserDoc } from "@repo/schemas"
import { type User } from "firebase/auth"
import { type SessionUser, sessionUserSchema } from "@/schemas/session"

export const formatSessionFromFirebaseUser = ({
  user,
  authUser,
  rightsDoc
}: {
  user: UserDoc
  authUser: User
  rightsDoc: RightDoc | null
}): SessionUser => {
  const { uid, photoURL, displayName } = authUser
  const { email, pseudo, photoUrl } = user

  const sessionUser = sessionUserSchema.safeParse({
    id: uid,
    email,
    photoUrl: photoUrl || photoURL || "",
    rights: rightsDoc?.right,
    pseudo: pseudo || displayName
  })

  if (!sessionUser.success) {
    throw new Error("Invalid session user data", { cause: sessionUser.error })
  }

  return sessionUser.data
}
