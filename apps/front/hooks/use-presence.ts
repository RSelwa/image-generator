import { LOBBY_STATUS } from "@repo/common"
import { onDisconnect, ref, remove, set } from "firebase/database"
import { useEffect, useRef } from "react"
import { rtdb } from "@/constants/db"

export const usePresence = (lobbyId: string | null, userId: string | undefined, lobbyStatus: string | undefined) => {
  const lobbyStatusRef = useRef(lobbyStatus)
  lobbyStatusRef.current = lobbyStatus

  const presenceNodeRef = useRef<ReturnType<typeof ref> | null>(null)
  const disconnectNodeRef = useRef<ReturnType<typeof onDisconnect> | null>(null)

  useEffect(() => {
    if (!lobbyId || !userId) return
    if (lobbyStatusRef.current !== LOBBY_STATUS.WAITING) return

    const path = `lobbies/${lobbyId}/players/${userId}`
    const presenceRefNode = ref(rtdb, path)
    const disconnectRefNode = onDisconnect(presenceRefNode)

    presenceNodeRef.current = presenceRefNode
    disconnectNodeRef.current = disconnectRefNode

    console.info("[RTDB] Setting presence at path:", path)
    set(presenceRefNode, true)
      .then(() => {
        console.info("[RTDB] Presence set successfully at", path)
        return disconnectRefNode.remove()
      })
      .then(() => console.info("[RTDB] onDisconnect registered at", path))
      .catch((err) => console.error("[RTDB] Failed to set presence:", err))
  }, [lobbyId, userId])

  useEffect(() => {
    return () => {
      if (presenceNodeRef.current) {
        console.info("[RTDB] Cleanup: removing presence on unmount")
        disconnectNodeRef.current?.cancel()
        remove(presenceNodeRef.current)
      }
    }
  }, [])
}
