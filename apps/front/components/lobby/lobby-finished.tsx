import { usePathname } from "next/navigation"
import * as React from "react"
import { APP_NAME } from "@/constants/mapping"
import { useGetNumberGameFoundByPlayerQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyFinished = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const userId = useAppSelector(selectUserId)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId || !userId,
  })
  const { data: numberGameFound } = useGetNumberGameFoundByPlayerQuery({ lobbyId, playerId: userId }, {
    skip: !lobbyId || !userId,
  })

  return (
    <main className="min-h-full-height bg-background text-foreground">
      <h1>{APP_NAME}</h1>
      <p> {numberGameFound?.numberGameFound}</p>
      <p> {lobby?.maximumPossiblePoints}</p>
    </main>
  )
}

export default LobbyFinished
