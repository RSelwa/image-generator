"use client"

import { LOBBY_STATUS } from "@repo/common"
import { useRouter } from "next/navigation"
import * as React from "react"
import LobbyFinished from "@/components/lobby/lobby-finished"
import LobbyPlaying from "@/components/lobby/lobby-playing"
import LobbyStarting from "@/components/lobby/lobby-starting"
import LobbyWaiting from "@/components/lobby/lobby-waiting"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const LoadingLobby = () => (
  <main className="min-h-full-height flex items-center justify-center">
    <p className="text-lg text-muted-foreground">Loading...</p>
  </main>
)

const NoLobby = () => {
  const router = useRouter()

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Lobby not found</p>
      <Button variant="outline" className="ml-4" onClick={() => router.push(PAGES.HOME)}>
        Go back home
      </Button>
    </main>
  )
}

type Props = {
  lobbyId: string
}

const LobbyMain = ({ lobbyId }: Props) => {
  const user = useAppSelector(selectUser)

  const { data: lobby, isLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const isUserInLobby = lobby?.players.some((p) => p.uid === user?.id)

  if (isLoading) return <LoadingLobby />

  if (!lobby || !isUserInLobby) return <NoLobby />

  if (lobby.status === LOBBY_STATUS.WAITING) return <LobbyWaiting lobbyId={lobbyId} />
  if (lobby.status === LOBBY_STATUS.STARTING) return <LobbyStarting lobbyId={lobbyId} />
  if (lobby.status === LOBBY_STATUS.PLAYING) return <LobbyPlaying lobbyId={lobbyId} />
  if (lobby.status === LOBBY_STATUS.FINISHED) return <LobbyFinished lobbyId={lobbyId} />

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Game in progress...</p>
    </main>
  )
}

export default LobbyMain
