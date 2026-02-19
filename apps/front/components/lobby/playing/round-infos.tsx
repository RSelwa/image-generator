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
    <div className="absolute font-fraktion-mono z-10 top-4 right-8 flex flex-col items-end pr-8 text-foreground text-shadow-primary text-shadow">
      <p>
        Stage: <span className="text-xl text-primary font-bold">{currentRoundData?.stage}</span>
      </p>
      <p>
        Level: <span className="text-xl text-primary font-bold">{lobby?.currentRound}/{config?.numberOfRounds}</span>
      </p>
      <p>
        Your score: <span className="text-xl text-primary font-bold">{player?.score} pts</span>
      </p>
    </div>
  )
}
