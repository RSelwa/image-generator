"use client"

import { getDateString, LOBBY_STATUS, USER_RIGHT } from "@repo/common"
import { usePathname } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyMutation, useUpdateNextRoundMutation } from "@/redux/api/lobby"
import { selectUserRights } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

export const LobbyDebug = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const rights = useAppSelector(selectUserRights)

  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const [startLobby] = useStartLobbyMutation()

  const [nextRound] = useUpdateNextRoundMutation()
  const [updateLobby] = useUpdateLobbyMutation()

  if (!lobby || rights !== USER_RIGHT.ADMIN) return null

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Admin debug</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          Started at: {getDateString(lobby?.roundStartedAt?.toDate())}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          Current round: {lobby?.currentRound}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
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
        </DropdownMenuItem>

        <DropdownMenuItem>
          <section className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => startLobby({ lobbyId })}
            >
              Start
            </Button>
            <Button onClick={() => nextRound({ lobbyId })}>
              Next
            </Button>
          </section>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>

  )
}
