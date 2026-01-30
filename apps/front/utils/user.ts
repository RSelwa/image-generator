import { type UserDoc } from "@repo/schemas"
import { type User } from "firebase/auth"
import { type SessionUser, sessionUserSchema } from "@/schemas/session"

export function formatSessionFromFirebaseUser({
  user,
  authUser,
}: {
  user: UserDoc
  authUser: User
}): SessionUser {
  const { uid, photoURL } = authUser
  const { email, rights } = user

  const sessionUser = sessionUserSchema.safeParse({
    id: uid,
    email,
    photoUrl: photoURL || "",
    rights,
  })

  if (!sessionUser.success) {
    throw new Error("Invalid session user data")
  }

  return sessionUser.data
}
