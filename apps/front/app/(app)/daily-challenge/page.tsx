"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { PathNode } from "@/components/daily-challenge/node"
import { AuthGuard } from "@/components/guards/auth-guard"
import { INITIAL_DAYS, ITEM_HEIGHT, LOAD_MORE_DAYS, PADDING_Y, PATH_WIDTH } from "@/constants/daily-challenges"
import { buildPath, generateDates } from "@/utils/daily-challenge"

const DailyChallengeContent = () => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [dayCount, setDayCount] = useState(INITIAL_DAYS)

  const dates = useMemo(() => generateDates(dayCount), [dayCount])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDayCount((prev) => prev + LOAD_MORE_DAYS)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [])

  const reachedLimit = dates.length < dayCount
  const totalHeight = dates.length * ITEM_HEIGHT + PADDING_Y * 2
  const pathD = useMemo(() => buildPath(dates.length), [dates.length])

  return (
    <div className="h-full-height overflow-y-auto flex justify-center">
      <div className="relative" style={{ width: PATH_WIDTH, height: totalHeight }}>
        <svg
          className="absolute text-primary/50 inset-0 pointer-events-none"
          width={PATH_WIDTH}
          height={totalHeight}
        >
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            strokeDasharray="16 12"
          />
        </svg>

        {dates.map((date, i) => (
          <PathNode
            key={date}
            date={date}
            index={i}
          />
        ))}

        {!reachedLimit && <div ref={sentinelRef} className="absolute w-full h-4" style={{ top: totalHeight - PADDING_Y / 2 }} />}
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
