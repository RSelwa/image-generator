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

    const presenceRef = ref(rtdb, `lobbies/${lobbyId}/players/${user.id}`)
    set(presenceRef, true)
    onDisconnect(presenceRef).remove()

    return () => { remove(presenceRef) }
  }, [lobbyId, user?.id, lobby?.status])

  useEffect(() => {
    if (isLoading || !lobby) return

    // Demo lobbies are already started with the player joined — skip join logic
    if (lobby.isDemo) return

    if (lobby.status !== LOBBY_STATUS.WAITING && lobby.status !== LOBBY_STATUS.FINISHED) {
      toast.error("This lobby is no longer accepting players")
      router.replace(PAGES.HOME)

      return
    }

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

    const player = createPlayerFromSessionUser(user)
    if (lobby.status === LOBBY_STATUS.WAITING) joinLobby({ lobbyId: lobby.id, player }).unwrap()
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
