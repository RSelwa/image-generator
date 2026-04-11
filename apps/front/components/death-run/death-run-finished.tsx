"use client"

import { skipToken } from "@reduxjs/toolkit/query/react"
import { type DeathRunDocWithId } from "@repo/schemas"
import { Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import { GameRow } from "@/components/race/race-finished"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { Link } from "@/i18n/routing"
import { useGetDeathRunRunsQuery } from "@/redux/api/death-run"
import { useSubscribeMarathonSeedQuery } from "@/redux/api/marathon-seed"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const DeathRunFinished = ({ deathRun }: { deathRun: DeathRunDocWithId }) => {
  const t = useTranslations("deathRunPage")
  const uid = useAppSelector(selectUserId)
  const { data: runs = [] } = useGetDeathRunRunsQuery({ deathRunId: deathRun.id })
  const { data: seed } = useSubscribeMarathonSeedQuery(deathRun.seedId ? { seedId: deathRun.seedId } : skipToken)

  const playerById = Object.fromEntries(deathRun.players.map((p) => [p.uid, p]))

  return (
    <div data-testid={SELECTORS.DEATH_RUN_FINISHED} className="h-full-height flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-1">
        <Trophy className="size-12 text-yellow-500 mx-auto" />
        <h1 className="text-3xl font-bold">{t("finished")}</h1>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {runs.map((run, i) => {
          const player = playerById[run.uid]
          const isMe = run.uid === uid
          const correct = run.answers.filter((a) => a.isCorrect).length

          return (
            <div
              key={run.uid}
              className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? "border-primary bg-primary/5" : ""}`}
            >
              <span className="font-mono font-bold w-6 text-muted-foreground">{i + 1}.</span>
              <UserAvatar name={player?.name || "?"} className="size-8" />
              <span className="font-medium flex-1">{player?.name || run.uid}</span>
              <span
                data-testid={SELECTORS.DEATH_RUN_FINISHED_SCORE(run.uid)}
                className="font-mono font-bold text-primary"
              >
                {run.score} pts
              </span>
              <span
                data-testid={SELECTORS.DEATH_RUN_FINISHED_ROUNDS(run.uid)}
                className="text-xs text-muted-foreground"
              >
                {correct} {t("correct")}
              </span>
            </div>
          )
        })}
      </div>

      {seed?.rounds && seed.rounds.length > 0 && (
        <section className="w-full max-w-sm space-y-2 border border-primary rounded-lg p-4">
          <h2 className="text-sm font-semibold text-primary">{t("recap")} ({seed.rounds.length})</h2>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto text-sm text-muted-foreground">
            {seed.rounds.map((round) => (
              <GameRow key={round.sphericalId || round.flatId} round={round} />
            ))}
          </div>
        </section>
      )}

      <Link href={PAGES.DEATH_RUN}>
        <Button variant="outline">{t("backToDeathRuns")}</Button>
      </Link>
    </div>
  )
}

export default DeathRunFinished
