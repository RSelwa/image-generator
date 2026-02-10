import { usePathname } from "next/navigation"
import * as React from "react"
import Logo from "@/components/icons/logo"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { APP_NAME } from "@/constants/mapping"
import { useGetNumberGameFoundByPlayerQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectLobbyConfig, selectPlayerMyself } from "@/redux/lobby/lobby.selectors"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyFinished = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const userId = useAppSelector(selectUserId)
  const player = useAppSelector(selectPlayerMyself(lobbyId))
  const config = useAppSelector(selectLobbyConfig(lobbyId))

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })
  const { data: numberGameFound } = useGetNumberGameFoundByPlayerQuery({ lobbyId, playerId: userId }, {
    skip: !lobbyId || !userId,
  })

  const percentageValuePoints = player && lobby ? (player.score / (lobby?.maximumPossiblePoints || 1)) * 100 : 0
  const percentageValueGamesFound = numberGameFound && config ? (numberGameFound.numberGameFound / config.numberOfRounds) * 100 : 0

  return (
    <main data-testId="lobby-finished" className="min-h-full-height w-1/2 mx-auto bg-background text-foreground flex flex-col items-center justify-center gap-8">
      <Logo />
      <h1>{APP_NAME}</h1>
      <Field className="w-full max-w-sm">
        <FieldLabel htmlFor="progress-points">
          <span>Final Score </span>
          <span className="ml-auto text-lg font-semibold">{player?.score}</span>
        </FieldLabel>
        <FieldLabel className="flex items-center gap-3 text-foreground/50">
          <span>0</span>
          <Progress value={percentageValuePoints} id="progress-points" />
          <span>{lobby?.maximumPossiblePoints}</span>
        </FieldLabel>
      </Field>
      <Field className="w-full max-w-sm">
        <FieldLabel htmlFor="progress-rounds">
          <span>Number game found</span>
          <span className="ml-auto text-lg font-semibold">{numberGameFound?.numberGameFound.toString()}</span>
        </FieldLabel>
        <FieldLabel className="flex items-center gap-3 text-foreground/50">
          <span>0</span>
          <Progress value={percentageValueGamesFound} id="progress-rounds" />
          <span>{config?.numberOfRounds}</span>
        </FieldLabel>
      </Field>
    </main>
  )
}

export default LobbyFinished
