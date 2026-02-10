import { usePathname } from "next/navigation"
import * as React from "react"
import { useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectLobbyConfig, selectPlayerMyself } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

export const RoundInfos = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const config = useAppSelector(selectLobbyConfig(lobbyId))
  const player = useAppSelector(selectPlayerMyself(lobbyId))

  return (
    <div className=" absolute z-10 top-4 right-8 flex flex-col items-end pr-8 text-foreground text-shadow-background text-shadow">
      <p>
        Stage: {currentRoundData?.stage}
      </p>
      <p>
        Level: {lobby?.currentRound}/{config?.numberOfRounds}
      </p>
      <p>
        Your score: {player?.score} pts
      </p>
    </div>
  )
}
