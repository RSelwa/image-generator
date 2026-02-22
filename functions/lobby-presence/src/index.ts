import { LOBBY_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { logger } from "firebase-functions"
import { onValueDeleted } from "firebase-functions/v2/database"
import { FieldValue } from "firebase-admin/firestore"

export const on_lobby_player_disconnected = onValueDeleted(
  {
    ref: "lobbies/{lobbyId}/players/{userId}",
    instance: "tiktok-generator-fa261-default-rtdb",
    region: "us-central1",
  },
  async (event) => {
    const { lobbyId, userId } = event.params

    logger.log(`[lobby-presence] Trigger fired!`)
    logger.log(`[lobby-presence] Event ref: ${event.ref}`)
    logger.log(`[lobby-presence] Event instance: ${event.instance}`)
    logger.log(`[lobby-presence] Params: lobbyId=${lobbyId}, userId=${userId}`)
    logger.log(`[lobby-presence] Deleted value: ${JSON.stringify(event.data.val())}`)
    logger.log(`Player ${userId} disconnected from lobby ${lobbyId}`)

    const lobbyRef = refs[TABLES.LOBBIES].doc(lobbyId)
    const lobbySnap = await lobbyRef.get()

    if (!lobbySnap.exists) {
      logger.warn(`Lobby ${lobbyId} not found`)
      return
    }

    const lobbyData = lobbySnap.data()

    if (lobbyData?.status !== LOBBY_STATUS.WAITING) {
      logger.log(`Lobby ${lobbyId} is not waiting (status: ${lobbyData?.status}), skipping removal`)
      return
    }

    const updatedPlayers = (lobbyData.players || []).filter(
      (p: { uid: string }) => p.uid !== userId,
    )
    const updatedPlayersIds = (lobbyData.playersIds || []).filter(
      (id: string) => id !== userId,
    )

    await lobbyRef.update({
      players: updatedPlayers,
      playersIds: updatedPlayersIds,
      updatedAt: FieldValue.serverTimestamp(),
    })

    logger.log(`Player ${userId} removed from lobby ${lobbyId}`)
  },
)
