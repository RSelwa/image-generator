"use client"

import { use } from "react"
import GameInputGuessDaily from "@/app/(app)/daily-challenge/[date]/game-input-guess"
import { ReactSphere } from "@/components/providers/react-sphere"
import { useGetDailyChallengeEntityByDateQuery, useGetMyDailyChallengeResultByDateQuery } from "@/redux/api/daily-challenge"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const DailyChallengeDatePage = ({ params }: { params: Promise<{ date: string }> }) => {
  const { date } = use(params)
  const userId = useAppSelector(selectUserId)

  const { data: challenge } = useGetDailyChallengeEntityByDateQuery({ date })
  const { data: result } = useGetMyDailyChallengeResultByDateQuery(
    { uid: userId!, date },
    { skip: !userId },
  )

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Challenge not found.</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-lg overflow-hidden aspect-video bg-muted">
        {challenge.isSpherical ? <ReactSphere src={challenge.sphericalImageUrl} /> : <img src={challenge.flatImageUrl} alt="Challenge" className="w-full h-full object-cover" />}
      </div>
      <GameInputGuessDaily date={date} />
      {result && (
        <div className="absolute">Result</div>
      )}
    </main>
  )
}

export default DailyChallengeDatePage
