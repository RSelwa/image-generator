"use client"

import { LOBBY_STATUS, USER_RIGHT } from "@repo/common"
import { useRouter } from "next/navigation"
import * as React from "react"
import LobbyFinished from "@/components/lobby/lobby-finished"
import LobbyPlaying from "@/components/lobby/lobby-playing"
import LobbyStarting from "@/components/lobby/lobby-starting"
import LobbyWaiting from "@/components/lobby/lobby-waiting"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGES } from "@/constants/pages"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyMutation, useUpdateNextRoundMutation } from "@/redux/api/lobby"
import { selectCurrentRoundData } from "@/redux/lobby/lobby.selectors"
import { selectUser, selectUserRights } from "@/redux/session/session.selectors"
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

export const LobbyDebug = ({ lobbyId }: Props) => {
  const rights = useAppSelector(selectUserRights)

  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const currenRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const [startLobby] = useStartLobbyMutation()

  const [nextRound] = useUpdateNextRoundMutation()
  const [updateLobby] = useUpdateLobbyMutation()

  if (!lobby || rights !== USER_RIGHT.ADMIN) return null

  return (
    <Popover>

      <PopoverTrigger asChild>
        <Button variant="secondary" className="absolute bottom-8 right-8 z-10">
          Admin Debug
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto grid grid-cols-2 gap-4">
        <div className="col-span-2">{currenRoundData?.gameTitle}</div>
        <div className="col-span-2">{lobby?.currentRound}</div>
        <div className="col-span-2">Points distance{currenRoundData?.pointsDistance}</div>
        <Select
          value={lobby.status}
          onValueChange={(value: any) => {
            if (!value) return
            if (!Object.values(LOBBY_STATUS).includes(value)) return

            updateLobby({ id: lobbyId, data: { status: value } })
          }}
          disabled={isLobbyLoading}
        >
          <SelectTrigger className="w-full col-span-2">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(LOBBY_STATUS)?.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          onClick={() => startLobby({ lobbyId })}
        >
          Start Lobby
        </Button>
        <Button onClick={() => nextRound({ lobbyId })}>
          Next Round
        </Button>
      </PopoverContent>
    </Popover>
  )
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
