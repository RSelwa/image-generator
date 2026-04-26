import { type ConstantValues } from "@repo/common"
import { DONOR_TIERS, getRandomAvatar } from "@repo/common"
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
  const { uid, displayName, isAnonymous } = authUser
  const { email, pseudo, isAnonymousUser, streak, lastStreakDate, donorTier, newsletter } = user

  const avatar = user.avatar || getRandomAvatar()

  const sessionUser = sessionUserSchema.safeParse({
    id: uid,
    email,
    rights: rightsDoc?.right,
    pseudo: pseudo || displayName,
    isAnonymous: isAnonymous || isAnonymousUser,
    avatar,
    streak,
    lastStreakDate,
    donorTier,
    newsletter
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
  avatar: getRandomAvatar(),
  streak: 0,
  lastStreakDate: null,
  donorTier: null,
  newsletter: false,
})

export const isAvatarGlow = (donorTier: ConstantValues<typeof DONOR_TIERS>) => donorTier === DONOR_TIERS.GOLD || donorTier === DONOR_TIERS.SILVER

export const isTextGlow = (donorTier: ConstantValues<typeof DONOR_TIERS> | null) => donorTier === DONOR_TIERS.GOLD

export const getDonorTierByRank = (rank: number) => {
  if (rank === 1) return DONOR_TIERS.GOLD
  if (rank === 2) return DONOR_TIERS.SILVER
  if (rank === 3) return DONOR_TIERS.BRONZE

  return null
}
