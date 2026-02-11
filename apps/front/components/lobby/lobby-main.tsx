"use client"

import { LOBBY_STATUS } from "@repo/common"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import LobbyFinished from "@/components/lobby/lobby-finished"
import LobbyStarting from "@/components/lobby/lobby-starting"
import LobbyWaiting from "@/components/lobby/lobby-waiting"
import LobbyPlaying from "@/components/lobby/playing/lobby-playing"
import { Button } from "@/components/ui/button"
import { auth } from "@/constants/db"
import { API_ENDPOINTS, QUERY_PARAMS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useJoinLobbyMutation, useLeaveLobbyMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
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
    <main className="min-h-full-height flex items-center justify-center text-foreground bg-primary">
      <p className="text-lg text-muted-primary-foreground">Lobby not found</p>
      <Button variant="outline" className="ml-4" onClick={() => router.push(PAGES.HOME)}>
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

  const [leaveLobby] = useLeaveLobbyMutation()
  const [joinLobby] = useJoinLobbyMutation()

  const { data: lobby, isLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const statusRef = useRef(lobby?.status)
  statusRef.current = lobby?.status

  const tokenRef = useRef("")
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    auth.currentUser?.getIdToken().then((token) => {
      tokenRef.current = token
    })
  }, [user?.id])

  useEffect(() => {
    clearTimeout(cleanupTimeoutRef.current)

    const tabCountKey = `lobby-${lobbyId}-tabs`
    const current = Number(localStorage.getItem(tabCountKey) || 0)
    localStorage.setItem(tabCountKey, String(current + 1))

    const handleBeforeUnload = () => {
      const count = Number(localStorage.getItem(tabCountKey) || 0)
      const remaining = Math.max(0, count - 1)
      localStorage.setItem(tabCountKey, String(remaining))

      if (remaining === 0 && statusRef.current === LOBBY_STATUS.WAITING) {
        const blob = new Blob(
          [JSON.stringify({ lobbyId, playerId: user?.id, token: tokenRef.current })],
          { type: "application/json" },
        )
        navigator.sendBeacon(API_ENDPOINTS.LEAVE_LOBBY, blob)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)

      const count = Number(localStorage.getItem(tabCountKey) || 0)
      const remaining = Math.max(0, count - 1)
      localStorage.setItem(tabCountKey, String(remaining))

      if (remaining === 0 && statusRef.current === LOBBY_STATUS.WAITING) {
        cleanupTimeoutRef.current = setTimeout(() => {
          leaveLobby({ lobbyId, playerId: user?.id || "" })
        }, 200)
      }
    }
  }, [lobbyId, user?.id, leaveLobby])

  useEffect(() => {
    if (isLoading || !lobby) return
    if (lobby.status !== LOBBY_STATUS.WAITING) {
      toast.error("This lobby is no longer accepting players")
      router.replace(PAGES.HOME)

      return
    }

    if ((isSessionReady && !user) || !user) {
      toast.error("You need to be logged to join the lobby")
      const searchParams = new URLSearchParams({ [QUERY_PARAMS.REDIRECT]: `${PAGES.JOIN_LOBBY}/${lobby.code}` })
      const url = new URL(`${PAGES.LOGIN}?${searchParams.toString()}`, window.location.origin)
      router.replace(url.href)

      return
    }

    const player = createPlayerFromSessionUser(user)

    joinLobby({ lobbyId: lobby.id, player })
      .unwrap()
  }, [isSessionReady, user])

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
