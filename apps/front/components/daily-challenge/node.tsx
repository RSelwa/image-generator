"use client"

import { Check, Lock, Star } from "lucide-react"
import Link from "next/link"
import { memo } from "react"
import { NODE_SIZE } from "@/constants/daily-challenges"
import { PAGES } from "@/constants/pages"
import { useGetDailyChallengeEntityByDateQuery } from "@/redux/api/daily-challenge"
import { getPoint } from "@/utils/daily-challenge"

export const PathNode = memo(({ date, index, isCompleted, today }: {
  date: string
  index: number
  isCompleted: boolean
  today: string
}) => {
  const { data: challenge, isLoading } = useGetDailyChallengeEntityByDateQuery({ date })

  const isToday = date === today
  const isFuture = date > today
  const hasChallenge = !!challenge
  const isLocked = isFuture || (!hasChallenge && !isLoading)
  const isAvailable = hasChallenge && !isCompleted && !isFuture

  const pt = getPoint(index)

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: pt.x, top: pt.y }}
    >
      {isToday && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            TODAY
          </div>
        </div>
      )}

      <Link
        href={isLocked ? "#" : PAGES.DAILY_CHALLENGE_DATE(date)}
        aria-disabled={isLocked}
        className={isLocked ? "pointer-events-none" : ""}
      >
        <div
          className={[
            "flex items-center justify-center rounded-full border-b-4 transition-transform",
            isCompleted && "bg-green-500 border-green-700 active:translate-y-0.5 active:border-b-2",
            isAvailable && "bg-green-400 border-green-600 ring-4 ring-green-200 active:translate-y-0.5 active:border-b-2",
            isLocked && "bg-gray-200 border-gray-300",
            isLoading && "animate-pulse",
          ].filter(Boolean).join(" ")}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        >
          {isCompleted && <Check className="size-7 text-white" strokeWidth={3} />}
          {isAvailable && <Star className="size-7 text-white" strokeWidth={3} />}
          {isLocked && <Lock className="size-5 text-gray-400" />}
        </div>
      </Link>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 rounded text-center bg-green-500 text-foreground">
        {date}
      </div>
    </div>
  )
})

PathNode.displayName = "PathNode"
