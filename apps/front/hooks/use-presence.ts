import { LOBBY_STATUS } from "@repo/common"
import { onDisconnect, ref, remove, set } from "firebase/database"
import { useEffect, useRef } from "react"
import { rtdb } from "@/constants/db"

export const usePresence = (lobbyId: string | null, userId: string | undefined, lobbyStatus: string | undefined) => {
  const presenceSetRef = useRef(false)
  const presenceNodeRef = useRef<ReturnType<typeof ref> | null>(null)
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!lobbyId || !userId || lobbyStatus !== LOBBY_STATUS.WAITING || presenceSetRef.current) return

    // Cancel any pending cleanup from strict mode's fake unmount
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current)
      cleanupTimeoutRef.current = null
      console.info("[RTDB] Cancelled pending cleanup (strict mode remount)")
    }

    presenceSetRef.current = true
    const path = `lobbies/${lobbyId}/players/${userId}`
    const presenceRefNode = ref(rtdb, path)
    const disconnectRefNode = onDisconnect(presenceRefNode)

    presenceNodeRef.current = presenceRefNode

    console.info("[RTDB] Setting presence at path:", path)
    // Register onDisconnect BEFORE setting the value, so the server
    // knows to clean up even if the connection drops immediately after set
    disconnectRefNode.remove()
      .then(() => {
        console.info("[RTDB] onDisconnect registered at", path)
        return set(presenceRefNode, true)
      })
      .then(() => console.info("[RTDB] Presence set successfully at", path))
      .catch((err) => console.error("[RTDB] Failed to set presence:", err))

    return () => {
      presenceSetRef.current = false
      cleanupTimeoutRef.current = setTimeout(() => {
        console.info("[RTDB] Cleanup: removing presence on unmount")
        remove(presenceRefNode)
        presenceNodeRef.current = null
        cleanupTimeoutRef.current = null
      }, 100)
    }
  }, [lobbyId, userId, lobbyStatus])
}
