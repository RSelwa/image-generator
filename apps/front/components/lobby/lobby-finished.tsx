import { usePathname } from "next/navigation"
import * as React from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { APP_NAME, ASSET_URLS } from "@/constants/mapping"
import { useGetNumberGameFoundByPlayerQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectLobbyConfig, selectPlayerMyself } from "@/redux/lobby/lobby.selectors"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn, getLobbyIdFromPathname } from "@/utils"
import { LogoWithIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import CreateLobbyButton from "@/components/home-create-lobby"
import Link from "next/link"
import { PAGES } from "@/constants/pages"

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
    <main data-testid="lobby-finished" className={cn("min-h-full-height flex items-center justify-center bg-background text-foreground", `bg-[url(${ASSET_URLS.CREATOR_BACKGROUND})] bg-repeat bg-center bg-size-[25%]`)}>
      <section className="w-1/2 flex flex-col items-center justify-center gap-8 bg-background/80">
        <LogoWithIcon className="text-primary h-52 mb-20" />
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
        <article className="flex items-center justify-center gap-4">
          <Link href={PAGES.HOME} passHref>
          <Button  variant="marathon-outline">Home</Button>
          </Link>
          <CreateLobbyButton>Play again</CreateLobbyButton>
        </article>
      </section>

    </main>
  )
}

export default LobbyFinished
