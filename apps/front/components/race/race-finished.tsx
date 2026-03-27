"use client"

import { type RaceDocWithId } from "@repo/schemas"
import { Trophy } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"
import { useGetRaceRunsQuery } from "@/redux/api/race"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const RaceFinished = ({ race }: { race: RaceDocWithId }) => {
  const uid = useAppSelector(selectUserId)
  const { data: runs = [] } = useGetRaceRunsQuery({ raceId: race.id })

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
              <UserAvatar name={player?.name || "?"} className="size-8" />
              <span className="font-medium flex-1">{player?.name || run.uid}</span>
              <span data-testid={`race-finished-score-${run.uid}`} className="font-mono font-bold text-primary">{run.score} pts</span>
              <span data-testid={`race-finished-rounds-${run.uid}`} className="text-xs text-muted-foreground">{run.answers.length} rounds</span>
            </div>
          )
        })}
      </div>

      <Link href={PAGES.RACE}>
        <Button variant="outline">Back to races</Button>
      </Link>
    </div>
  )
}

export default RaceFinished
