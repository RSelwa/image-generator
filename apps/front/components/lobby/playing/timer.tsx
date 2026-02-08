import { DEFAULT_TIME_PER_ROUND } from "@repo/common"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useCountdown } from "@/hooks/use-countdown"
import { useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundIndex, selectLobbyConfig } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const Timer = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const myAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const config = useAppSelector(selectLobbyConfig(lobbyId))

  const isMapPhase = myAnswer?.isCorrect && currentRoundData?.mapPosition
  const timerStart = (isMapPhase && myAnswer?.submittedAt) || lobby?.roundStartedAt

  const { timeRemaining } = useCountdown(timerStart, (config?.roundDuration || DEFAULT_TIME_PER_ROUND))

  return (
    <span className="absolute z-10 top-4 left-1/2 -translate-x-1/2 font-bold text-white drop-shadow-2xl text-center text-6xl">
      {timeRemaining}
    </span>
  )
}

export default Timer
