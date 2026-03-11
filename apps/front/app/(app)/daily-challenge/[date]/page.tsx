"use client"

import Image from "next/image"
import Link from "next/link"
import { use } from "react"
import GameInputGuessDaily from "@/app/(app)/daily-challenge/[date]/game-input-guess"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { useGetDailyChallengeEntityByDateQuery, useGetMyDailyChallengeResultByDateQuery } from "@/redux/api/daily-challenge"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const DailyChallengeDatePage = ({ params }: { params: Promise<{ date: string }> }) => {
  const { date } = use(params)
  const userId = useAppSelector(selectUserId)

  const { data: challenge } = useGetDailyChallengeEntityByDateQuery({ date })
  const { data: result, isLoading } = useGetMyDailyChallengeResultByDateQuery(
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
    <main className="h-full-height relative">
      <Button asChild variant="marathon-white">
        <Link href={PAGES.DAILY_CHALLENGE} className="absolute z-10 top-4 left-4">
          Back to Daily Challenge
        </Link>
      </Button>
      {challenge.isSpherical ? <ReactSphere src={challenge.sphericalImageUrl} /> : <Image src={challenge.flatImageUrl} alt="Challenge" width={1920} height={1080} className="aspect-video size-full object-contain" />}

      {!isLoading && (
        result ? <Image src={challenge.gameThumbnailUrl} alt={`${challenge.gameTitle}`} height={300} width={300} className="absolute left-1/2 lg:bottom-9 bottom-4 -translate-x-1/2 max-h-56 object-contain" /> : <GameInputGuessDaily date={date} />
      )}

    </main>
  )
}

export default DailyChallengeDatePage
