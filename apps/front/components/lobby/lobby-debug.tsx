"use client"

import { getDateString, LOBBY_STATUS, USER_RIGHT } from "@repo/common"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyMutation, useUpdateNextRoundMutation } from "@/redux/api/lobby"
import { selectCurrentRoundData } from "@/redux/lobby/lobby.selectors"
import { selectUserRights } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

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
        <div className="col-span-2">Started at:{currenRoundData?.gameTitle}</div>
        {
          lobby?.roundStartedAt &&
          <div className="col-span-2">{getDateString(lobby?.roundStartedAt?.toDate())}</div>
        }
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
