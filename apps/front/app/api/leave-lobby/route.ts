import { LOBBY_STATUS, TABLES } from "@repo/common"
import { auth, db } from "@repo/providers/firebase"
import { FieldValue } from "firebase-admin/firestore"
import z from "zod"

const leaveLobbyPayload = z.object({
  lobbyId: z.string().min(1),
  playerId: z.string().min(1),
  token: z.string().optional(),
})

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const parsed = leaveLobbyPayload.safeParse(body)

    if (!parsed.success) {
      return new Response("Invalid payload", { status: 400 })
    }

    const { lobbyId, playerId, token } = parsed.data

    if (token) {
      const verifiedToken = await auth.verifyIdToken(token).catch(() => null)

      if (verifiedToken && verifiedToken.uid !== playerId) {
        return new Response("Unauthorized", { status: 403 })
      }
    }

    const lobbyRef = db.collection(TABLES.LOBBIES).doc(lobbyId)
    const lobbySnap = await lobbyRef.get()

    if (!lobbySnap.exists) {
      return new Response("Lobby not found", { status: 404 })
    }

    const lobbyData = lobbySnap.data()

    if (lobbyData?.status !== LOBBY_STATUS.WAITING) {
      return new Response("Lobby is not in waiting status", { status: 400 })
    }

    const updatedPlayers = (lobbyData.players || []).filter(
      (p: { uid: string }) => p.uid !== playerId,
    )

    await lobbyRef.update({
      players: updatedPlayers,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Error in leave-lobby:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
