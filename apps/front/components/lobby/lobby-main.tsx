"use client"

import { LOBBY_STATUS } from "@repo/common"
import { onDisconnect, ref, remove, set } from "firebase/database"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import LobbyFinished from "@/components/lobby/lobby-finished"
import LobbyStarting from "@/components/lobby/lobby-starting"
import LobbyWaiting from "@/components/lobby/lobby-waiting"
import LobbyPlaying from "@/components/lobby/playing/lobby-playing"
import { Button } from "@/components/ui/button"
import { rtdb } from "@/constants/db"
import { QUERY_PARAMS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useJoinLobbyMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectSessionIsReady, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import { createPlayerFromSessionUser } from "@/utils/player"

const LoadingLobby = () => (
  <main className="min-h-full-height flex items-center justify-center">
    <p className="text-lg text-muted-primary-foreground">Loading...</p>
  </main>
)

const NoLobby = () => {
  const router = useRouter()

  return (
    <main className="min-h-full-height flex items-center justify-center text-primary bg-background">
      <p className="text-lg">Lobby not found</p>
      <Button variant="marathon-outline" className="ml-4" onClick={() => router.push(PAGES.HOME)}>
        Go back home
      </Button>
    </main>
  )
}

const LobbyMain = () => {
  const router = useRouter()
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const user = useAppSelector(selectUser)
  const isSessionReady = useAppSelector(selectSessionIsReady)

  const [joinLobby] = useJoinLobbyMutation()

  const { data: lobby, isLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  useEffect(() => {
    if (!lobbyId || !user?.id || lobby?.status !== LOBBY_STATUS.WAITING) return

    const path = `lobbies/${lobbyId}/players/${user.id}`
    const presenceRef = ref(rtdb, path)
    console.log("[RTDB] Setting presence at path:", path)
    console.log("[RTDB] Database URL:", rtdb.app.options.databaseURL)
    set(presenceRef, true)
      .then(() => console.log("[RTDB] Presence set successfully at", path))
      .catch((err) => console.error("[RTDB] Failed to set presence:", err))
    onDisconnect(presenceRef).remove()
      .then(() => console.log("[RTDB] onDisconnect registered at", path))
      .catch((err) => console.error("[RTDB] Failed to register onDisconnect:", err))

    return () => {
      console.log("[RTDB] Cleanup: removing presence at", path)
      remove(presenceRef)
    }
  }, [lobbyId, user?.id, lobby?.status])

  useEffect(() => {
    if (isLoading || !lobby) return

    // Demo lobbies are already started with the player joined — skip join logic
    if (lobby.isDemo) return

    if ((isSessionReady && !user) || !user) {
      console.info("User not logged in, redirecting to login page")

      return
    }

    if (user.isAnonymous) {
      toast.error("You need to be logged to join the lobby")

      const searchParams = new URLSearchParams({ [QUERY_PARAMS.REDIRECT]: `${PAGES.JOIN_LOBBY}/${lobby.code}` })
      const url = new URL(`${PAGES.LOGIN}?${searchParams.toString()}`, window.location.origin)

      router.replace(url.href)

      return
    }

    // Allow existing players to reconnect regardless of lobby status
    const isAlreadyInLobby = lobby.players.some((p) => p.uid === user.id)
    if (isAlreadyInLobby) return

    // Only allow new players to join during WAITING
    if (lobby.status !== LOBBY_STATUS.WAITING) {
      toast.error("This lobby is no longer accepting players")
      router.replace(PAGES.HOME)

      return
    }

    const player = createPlayerFromSessionUser(user)
    joinLobby({ lobbyId: lobby.id, player }).unwrap()
  }, [isSessionReady, user, user?.isAnonymous])

  const isUserInLobby = lobby?.players.some((p) => p.uid === user?.id)

  if (isLoading) return <LoadingLobby />

  if ((!lobby || !isUserInLobby)) return <NoLobby />

  if (lobby.status === LOBBY_STATUS.WAITING) return <LobbyWaiting />
  if (lobby.status === LOBBY_STATUS.STARTING) return <LobbyStarting />
  if (lobby.status === LOBBY_STATUS.PLAYING) return <LobbyPlaying />
  if (lobby.status === LOBBY_STATUS.FINISHED) return <LobbyFinished />

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-primary-foreground">Game in progress...</p>
    </main>
  )
}

export default LobbyMain
