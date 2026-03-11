"use client"

import { dateToString } from "@repo/common"
import { Check, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { AuthGuard } from "@/components/guards/auth-guard"
import Loader from "@/components/icons/loader"
import { PAGES } from "@/constants/pages"
import { useGetDailyChallengesByWeekQuery, useGetMyDailyChallengeResultsQuery } from "@/redux/api/daily-challenge"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const ZIGZAG_X = [0.5, 0.22, 0.72, 0.3, 0.68, 0.18, 0.6, 0.38]
const ITEM_HEIGHT = 120
const NODE_SIZE = 64
const PATH_WIDTH = 340
const PADDING_Y = 80

const getWeekStart = (): string => {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))

  return monday.toISOString().slice(0, 10)
}

const DailyChallengeContent = () => {
  const userId = useAppSelector(selectUserId)
  const currentRef = useRef<HTMLDivElement>(null)

  const { data: challenges, isLoading: isLoadingChallenges } = useGetDailyChallengesByWeekQuery({ weekStart: getWeekStart() })
  const { data: results, isLoading: isLoadingResults } = useGetMyDailyChallengeResultsQuery(
    { uid: userId! },
    { skip: !userId },
  )

  const isLoading = isLoadingChallenges || isLoadingResults

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [challenges, results])

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader className="size-8" />
    </div>
  )

  if (!challenges || challenges.length === 0) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No daily challenges yet.</p>
    </div>
  )

  const today = dateToString(new Date())
  const resultByDate = Object.fromEntries((results || []).map((r) => [r.date, r]))
  const sorted = [...challenges].sort((a, b) => a.date.localeCompare(b.date))

  const totalHeight = sorted.length * ITEM_HEIGHT + PADDING_Y * 2

  const points = sorted.map((_, i) => ({
    x: (ZIGZAG_X[i % ZIGZAG_X.length] || 0.5) * PATH_WIDTH,
    y: totalHeight - PADDING_Y - i * ITEM_HEIGHT,
  }))

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = points[i - 1]!
    const cy = ITEM_HEIGHT * 0.6

    return `${acc} C ${prev.x} ${prev.y - cy} ${pt.x} ${pt.y + cy} ${pt.x} ${pt.y}`
  }, "")

  return (
    <div className="h-full-height overflow-y-auto flex justify-center">
      <div className="relative" style={{ width: PATH_WIDTH, height: totalHeight }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={PATH_WIDTH}
          height={totalHeight}
        >
          <path
            d={pathD}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="16 12"
          />
        </svg>

        {sorted.map((challenge, i) => {
          const result = resultByDate[challenge.date]
          const isLocked = challenge.date > today
          const isToday = challenge.date === today
          const isCompleted = !!result
          const isAvailable = !isLocked && !isCompleted
          const pt = points[i]!

          return (
            <div
              key={challenge.date}
              ref={isToday ? currentRef : undefined}
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
                href={isLocked ? "#" : PAGES.DAILY_CHALLENGE_DATE(challenge.date)}
                aria-disabled={isLocked}
                className={isLocked ? "pointer-events-none" : ""}
              >
                <div
                  className={[
                    "flex items-center justify-center rounded-full border-b-4 transition-transform",
                    isCompleted && "bg-green-500 border-green-700 active:translate-y-0.5 active:border-b-2",
                    isAvailable && "bg-green-400 border-green-600 ring-4 ring-green-200 active:translate-y-0.5 active:border-b-2",
                    isLocked && "bg-gray-200 border-gray-300",
                  ].filter(Boolean).join(" ")}
                  style={{ width: NODE_SIZE, height: NODE_SIZE }}
                >
                  {isCompleted && <Check className="size-7 text-white" strokeWidth={3} />}
                  {isAvailable && <Check className="size-7 text-white" strokeWidth={3} />}
                  {isLocked && <Lock className="size-5 text-gray-400" />}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DailyChallengePage = () => (
  <AuthGuard>
    <DailyChallengeContent />
  </AuthGuard>
)

export default DailyChallengePage
