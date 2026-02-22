"use client"

import { LOBBY_STATUS } from "@repo/common"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import LobbyFinished from "@/components/lobby/lobby-finished"
import LobbyStarting from "@/components/lobby/lobby-starting"
import LobbyWaiting from "@/components/lobby/lobby-waiting"
import LobbyPlaying from "@/components/lobby/playing/lobby-playing"
import { Button } from "@/components/ui/button"
import { QUERY_PARAMS } from "@/constants/mapping"
import { usePresence } from "@/hooks/use-presence"
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

const NoUserInLobby = () => {
  const router = useRouter()

  return (
    <main className="min-h-full-height flex items-center justify-center text-primary bg-background">
      <p className="text-lg">You're not allowed in this lobby</p>
      <Button variant="marathon-outline" className="ml-4" onClick={() => router.push(PAGES.HOME)}>
        Go back home
      </Button>
    </main>
  )
}

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

  usePresence(lobbyId, user?.id, lobby?.status)

  useEffect(() => {
    if (isLoading || !lobby || lobby?.isDemo) return

    console.log("A");


    if ((isSessionReady && !user) || !user) {
      console.info("User not logged in, redirecting to login page")

      return
    }
    console.log("B");


    if (user.isAnonymous) {
      toast.error("You need to be logged to join the lobby")

      const searchParams = new URLSearchParams({ [QUERY_PARAMS.REDIRECT]: `${PAGES.JOIN_LOBBY}/${lobby.code}` })
      const url = new URL(`${PAGES.LOGIN}?${searchParams.toString()}`, window.location.origin)

      router.replace(url.href)

      return
    }

    console.log("C");


    // Allow existing players to reconnect regardless of lobby status
    const isAlreadyInLobby = lobby.players.some((p) => p.uid === user.id)
    console.log("Already in lobby? ", isAlreadyInLobby, lobby, user);
    
    if (isAlreadyInLobby) return

  console.log("D");

    // Only allow new players to join during WAITING
    if (lobby.status !== LOBBY_STATUS.WAITING) {
      toast.error("This lobby is no longer accepting players")
      router.replace(PAGES.HOME)

      return
    }
    console.log("E");
    

    const player = createPlayerFromSessionUser(user)
    joinLobby({ lobbyId: lobby.id, player }).unwrap()
  }, [isSessionReady, user, user?.isAnonymous])

  const isUserInLobby = lobby?.players.some((p) => p.uid === user?.id)

  if (isLoading) return <LoadingLobby />

  if ((!lobby )) return <NoLobby />
  if ((!isUserInLobby)) return <NoUserInLobby />

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
