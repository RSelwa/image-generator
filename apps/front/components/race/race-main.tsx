"use client"

import { RACE_STATUS } from "@repo/common"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import RaceFinished from "@/components/race/race-finished"
import RacePlaying from "@/components/race/race-playing"
import RaceWaiting from "@/components/race/race-waiting"
import { useSubscribeMarathonSeedQuery } from "@/redux/api/marathon-seed"
import { useCreateRaceRunMutation, useSubscribeRaceQuery, useSubscribeRaceRunQuery } from "@/redux/api/race"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getRaceIdFromPathname } from "@/utils"

const RaceMain = () => {
  const pathname = usePathname()
  const raceId = getRaceIdFromPathname(pathname)
  const user = useAppSelector(selectUser)

  const { data: race, isLoading: raceLoading } = useSubscribeRaceQuery({ raceId }, { skip: !raceId })
  const { data: run } = useSubscribeRaceRunQuery(
    { raceId, uid: user?.id || "" },
    { skip: !raceId || !user?.id },
  )
  const { data: seed } = useSubscribeMarathonSeedQuery(
    { seedId: race?.seedId || "" },
    { skip: !race?.seedId },
  )
  const [createRaceRun] = useCreateRaceRunMutation()

  // Create raceRun for this player when race starts playing and they don't have one yet
  useEffect(() => {
    if (race?.status === RACE_STATUS.PLAYING && user?.id && !run) {
      createRaceRun({ raceId, uid: user.id })
    }
  }, [race?.status, user?.id, run, raceId, createRaceRun])

  if (raceLoading) return null
  if (!race) return <p className="p-8 text-center text-muted-foreground">Race not found.</p>

  if (race.status === RACE_STATUS.WAITING) return <RaceWaiting race={race} />

  if (race.status === RACE_STATUS.STARTING) return (
    <div className="h-full-height flex flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Preparing race…</p>
      <p className="text-muted-foreground text-sm">Generating your seed, this will only take a moment.</p>
    </div>
  )

  if (race.status === RACE_STATUS.FINISHED) return <RaceFinished race={race} />

  if (!run || !seed) return null

  return <RacePlaying {...{ race, run, seed }} />
}

export default RaceMain
