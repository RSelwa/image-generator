"use client"

import { skipToken } from "@reduxjs/toolkit/query/react"
import { type MarathonSeedRound, type RaceDocWithId } from "@repo/schemas"
import { Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"
import { useGetAllGamesNamesQuery, useGetGameByIdQuery } from "@/redux/api/games"
import { useSubscribeMarathonSeedQuery } from "@/redux/api/marathon-seed"
import { useGetRaceRunsQuery } from "@/redux/api/race"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { isTextGlow } from "@/utils/user"

export const GameRow = ({ round }: { round: MarathonSeedRound }) => {
  const { data: allGames = [] } = useGetAllGamesNamesQuery()
  const { data: gameData, isLoading } = useGetGameByIdQuery({ id: round.gameId }, { skip: !round.gameId })

  const game = allGames.find((g) => g.id === round.gameId)

  if (isLoading) {
    return (
      <Skeleton className="flex relative items-center justify-center py-4" />
    )
  }

  if (!game || (!gameData)) {
    return (
      <article className="flex relative items-center justify-center py-4">
        <div>Unknown Game</div>
      </article>
    )
  }

  return (
    <Popover>
      <PopoverTrigger>
        <article className="flex relative items-center justify-center py-4">
          <img src={round.sphericalImageUrl || round.flatImageUrl || ""} alt={game?.title || "Game image"} className="size-full absolute opacity-30 inset-0 -z-10 object-cover rounded" />
          {game && <div>{game.title}</div>}
        </article>
      </PopoverTrigger>
      <PopoverContent side="right" asChild>
        <div className="w-full flex flex-col items-center  gap-4">
          <img src={gameData.image} alt={gameData?.title} className="size-full max-h-36 object-contain rounded" />
          <h3 className="text-lg font-semibold">{gameData?.title}</h3>
          <div className="aspect-video h-40 justify-center items-center flex">
            {round.sphericalImageUrl && (
              <div className="size-full overflow-hidden">
                <ReactSphere src={round.sphericalImageUrl} />
              </div>
            )}
            {round.flatImageUrl && (<img src={round.flatImageUrl} alt={game?.title || "Game image"} className="size-full object-cover rounded" />)}
          </div>
        </div>
      </PopoverContent>
    </Popover>

  )
}

const RaceFinished = ({ race }: { race: RaceDocWithId }) => {
  const t = useTranslations("raceMode")

  const uid = useAppSelector(selectUserId)
  const { data: runs = [] } = useGetRaceRunsQuery({ raceId: race.id })
  const { data: seed } = useSubscribeMarathonSeedQuery(race.seedId ? { seedId: race.seedId } : skipToken)

  const playerById = Object.fromEntries(race.players.map((p) => [p.uid, p]))

  return (
    <div data-testid="race-finished" className="h-full-height flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-1">
        <Trophy className="size-12 text-yellow-500 mx-auto" />
        <h1 className="text-3xl font-bold">Race Over</h1>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {runs.map((run, i) => {
          const player = playerById[run.uid]
          const isMe = run.uid === uid

          return (
            <div
              key={run.uid}
              className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? "border-primary bg-primary/5" : ""}`}
            >
              <span className="font-mono font-bold w-6 text-muted-foreground">{i + 1}.</span>
              <UserAvatar {...player} name={player?.name || "?"} className="size-8" />
              <span data-text-glow={isTextGlow(player.donorTier)} className="font-medium flex-1">{player?.name || run.uid}</span>
              <span data-testid={`race-finished-score-${run.uid}`} className="font-mono font-bold text-primary">{run.score} pts</span>
              <span data-testid={`race-finished-rounds-${run.uid}`} className="text-xs text-muted-foreground">{run.answers.length} rounds</span>
            </div>
          )
        })}
      </div>

      {seed?.rounds && (
        <section className="w-full max-w-sm space-y-4 border border-primary">
          <h2 className="text-lg font-semibold px-4 font-interference text-primary">{t("recap")}</h2>
          <div className="flex flex-col gap-2 max-h-72 overflow-scroll">
            {seed?.rounds?.map((round) => (
              <GameRow key={round.sphericalId || round.flatId} round={round} />
            ))}
          </div>
        </section>
      )}

      <Link href={PAGES.RACE}>
        <Button variant="outline">Back to races</Button>
      </Link>
    </div>
  )
}

export default RaceFinished
