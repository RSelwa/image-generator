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
  const { uid, photoURL, displayName, isAnonymous } = authUser
  const { email, pseudo, photoUrl, isAnonymousUser } = user

  const sessionUser = sessionUserSchema.safeParse({
    id: uid,
    email,
    photoUrl: photoUrl || photoURL || "",
    rights: rightsDoc?.right,
    pseudo: pseudo || displayName,
    isAnonymous: isAnonymous || isAnonymousUser
  })

  if (!sessionUser.success) {
    throw new Error("Invalid session user data", { cause: sessionUser.error })
  }

  return sessionUser.data
}

export const formatSessionFromAnonymousUser = ({ authUser}: { authUser: User }): SessionUser => ({
  id: authUser.uid,
  email: "",
  photoUrl: "",
  rights: null,
  pseudo: `Demo-${authUser.uid.slice(0, 5)}`,
  isAnonymous: true
})
