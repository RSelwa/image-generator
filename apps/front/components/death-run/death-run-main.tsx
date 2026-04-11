"use client"

import { DEATH_RUN_STATUS } from "@repo/common"
import { usePathname } from "next/navigation"
import DeathRunFinished from "@/components/death-run/death-run-finished"
import DeathRunPlaying from "@/components/death-run/death-run-playing"
import DeathRunWaiting from "@/components/death-run/death-run-waiting"
import { useSubscribeMarathonSeedQuery } from "@/redux/api/marathon-seed"
import { useSubscribeDeathRunQuery, useSubscribeDeathRunRunQuery } from "@/redux/api/death-run"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getDeathRunIdFromPathname } from "@/utils"

const DeathRunMain = () => {
  const pathname = usePathname()
  const deathRunId = getDeathRunIdFromPathname(pathname)
  const user = useAppSelector(selectUser)

  const { data: deathRun, isLoading } = useSubscribeDeathRunQuery({ deathRunId }, { skip: !deathRunId })
  const { data: run } = useSubscribeDeathRunRunQuery(
    { deathRunId, uid: user?.id || "" },
    { skip: !deathRunId || !user?.id },
  )
  const { data: seed } = useSubscribeMarathonSeedQuery(
    { seedId: deathRun?.seedId || "" },
    { skip: !deathRun?.seedId },
  )

  if (isLoading) return null
  if (!deathRun) return <p className="p-8 text-center text-muted-foreground">Death run not found.</p>

  if (deathRun.status === DEATH_RUN_STATUS.WAITING) return <DeathRunWaiting deathRun={deathRun} />

  if (deathRun.status === DEATH_RUN_STATUS.STARTING) return (
    <div className="h-full-height flex flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Preparing…</p>
      <p className="text-muted-foreground text-sm">Generating your seed, this will only take a moment.</p>
    </div>
  )

  if (deathRun.status === DEATH_RUN_STATUS.FINISHED) return <DeathRunFinished deathRun={deathRun} />

  if (!run || !seed) return null

  return <DeathRunPlaying deathRun={deathRun} run={run} seed={seed} />
}

export default DeathRunMain
