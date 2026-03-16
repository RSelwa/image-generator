"use client"

import { Flame } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"
import { PathNode } from "@/components/daily-challenge/node"
import { AuthGuard } from "@/components/guards/auth-guard"
import { INITIAL_DAYS, ITEM_HEIGHT, LOAD_MORE_DAYS, PADDING_Y, PATH_WIDTH } from "@/constants/daily-challenges"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { buildPath, generateDates, getVisualStreak } from "@/utils/daily-challenge"

const DailyChallengeContent = () => {
  const t = useTranslations("dailyChallenge")
  const user = useAppSelector(selectUser)
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

  const visualStreak = getVisualStreak(user?.streak || 0, user?.lastStreakDate || "")

  return (
    <div className="h-full-height overflow-y-auto flex justify-center">
      {visualStreak > 0 && (
        <div data-testid="streak-badge" className="fixed top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5 text-orange-500 font-bold text-sm">
          <Flame className="size-4" />
          <span>{t("streak", { count: visualStreak })}</span>
        </div>
      )}
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
