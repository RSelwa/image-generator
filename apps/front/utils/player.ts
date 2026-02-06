import { type Player } from "@repo/schemas"
import { type SessionUser } from "@/schemas/session"

export const createPlayerFromSessionUser = (sessionUser: SessionUser): Player => ({
  uid: sessionUser.id,
  name: "FakeName",
  avatar: sessionUser.photoUrl,
  score: 0,
  isHost: false,
  isReady: false,
  joinedAt: null,
})

export const generateRandomCode = (): string => Math.random().toString(36).substring(2, 8).toUpperCase()
