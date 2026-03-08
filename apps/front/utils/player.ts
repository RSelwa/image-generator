import { getRandomAvatar } from "@repo/common"
import { type Player } from "@repo/schemas"
import { type SessionUser } from "@/schemas/session"

export const createPlayerFromSessionUser = (sessionUser: SessionUser): Player => ({
  uid: sessionUser.id,
  name: sessionUser.pseudo,
  avatar: sessionUser.avatar || getRandomAvatar(),
  score: 0,
  isHost: false,
  isReady: false,
  joinedAt: null,
})

export const generateRandomCode = (): string => Math.random().toString(36).substring(2, 8).toUpperCase()

export const getPlayerFromLobby = (lobbyPlayers: Player[], userId: string | undefined): Player | null => {
  if (!userId) return null

  return lobbyPlayers.find((player) => player.uid === userId) || null
}
