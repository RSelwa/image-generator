import { type RightDoc, type UserDoc } from "@repo/schemas"
import { type User } from "firebase/auth"
import { type SessionUser, sessionUserSchema } from "@/schemas/session"
import { getRandomAvatar } from "@repo/common"
import { getAvatarUrl } from "@/utils/file"

export const formatSessionFromFirebaseUser = ({
  user,
  authUser,
  rightsDoc
}: {
  user: UserDoc
  authUser: User
  rightsDoc: RightDoc | null
}): SessionUser => {
  const { uid, displayName, isAnonymous } = authUser
  const { email, pseudo,  isAnonymousUser } = user

  const avatar = getAvatarUrl(user.avatar || getRandomAvatar())
  
  const sessionUser = sessionUserSchema.safeParse({
    id: uid,
    email,
    rights: rightsDoc?.right,
    pseudo: pseudo || displayName,
    isAnonymous: isAnonymous || isAnonymousUser,
    avatar
  })

  if (!sessionUser.success) {
    throw new Error("Invalid session user data", { cause: sessionUser.error })
  }

  return sessionUser.data
}

export const formatSessionFromAnonymousUser = ({ authUser, pseudo }: { authUser: User, pseudo: string }): SessionUser => ({
  id: authUser.uid,
  email: "",
  rights: null,
  pseudo,
  isAnonymous: true,
  avatar: getAvatarUrl(getRandomAvatar()),
})
