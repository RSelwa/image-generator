import type { SessionUser } from "@/schemas/session"
import type { UserDoc } from "@repo/schemas"
import type { User } from "firebase/auth"

export const formatSessionFromFirebaseUser = ({
  user,
  authUser,
}: {
  user: UserDoc
  authUser: User
}): SessionUser => {
  const { uid, photoURL } = authUser
  const { email, rights } = user

  const sessionUser: SessionUser = {
    id: uid,
    email: email,
    photoUrl: photoURL || "",
    rights,
  }

  return sessionUser
}
