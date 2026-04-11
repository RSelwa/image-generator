"use client"

import { type ConstantValues, dateToString } from "@repo/common"
import { cva } from "class-variance-authority"
import { memo, useMemo } from "react"
import { DailyChallengeContent, DailyChallengeLabel } from "@/components/daily-challenge/node-icons"
import { DAILY_CHALLENGES_VARIANTS, SIDE } from "@/constants/daily-challenges"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"
import { useGetDailyChallengeEntityByDateQuery, useGetMyDailyChallengeResultByDateQuery } from "@/redux/api/daily-challenge"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"
import { getDailyChallengeVariant, getPoint } from "@/utils/daily-challenge"

export const nodeVariants = cva(
  "flex size-16 overflow-hidden items-center font-mono font-bold justify-center transition-transform",
  {
    variants: {
      variant: {
        [DAILY_CHALLENGES_VARIANTS.FUTURE]: "bg-marathon-orange text-marathon-orange-foreground",
        [DAILY_CHALLENGES_VARIANTS.TODAY]: "bg-marathon-pink text-foreground",
        [DAILY_CHALLENGES_VARIANTS.COMPLETED_TODAY]:
          "bg-marathon-green text-marathon-green-foreground",
        [DAILY_CHALLENGES_VARIANTS.COMPLETED]:
          "bg-blue-accent-foreground text-foreground",
        [DAILY_CHALLENGES_VARIANTS.AVAILABLE]: "bg-marathon-yellow text-marathon-yellow-foreground",
        [DAILY_CHALLENGES_VARIANTS.LOADING]: "",
        [DAILY_CHALLENGES_VARIANTS.EMPTY]: "",
      },

    },
    defaultVariants: {
      variant: DAILY_CHALLENGES_VARIANTS.EMPTY,
    },
  }
)

export type PathNodeVariant = ConstantValues<typeof DAILY_CHALLENGES_VARIANTS>

type PathNodeVisualProps = {
  variant: PathNodeVariant
  date: string
  disabled?: boolean
  side?: ConstantValues<typeof SIDE>
}

export const PathNodeVisual = ({ variant, date, disabled, side = SIDE.LEFT }: PathNodeVisualProps) => (
  <div className="relative">
    <Link
      href={disabled ? "#" : PAGES.DAILY_CHALLENGE_DATE(date)}
      aria-disabled={disabled}
      data-disabled={disabled}
      data-testid={`daily-challenge-node-${date}-${variant}`}
      className={cn(nodeVariants({ variant }), "data-[disabled=true]:cursor-not-allowed")}
    >
      <DailyChallengeContent {...{ variant }} />
      <DailyChallengeLabel {...{ variant, side }} />

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 bg-inherit text-center">
        {date}
      </div>
    </Link>
  </div>
)

export const PathNode = memo(({ date, index }: {
  date: string
  index: number
}) => {
  const userId = useAppSelector(selectUserId)
  const today = useMemo(() => dateToString(new Date()), [])

  const { data: challenge, isLoading } = useGetDailyChallengeEntityByDateQuery({ date })
  const { data: result } = useGetMyDailyChallengeResultByDateQuery(
    { uid: userId || "", date },
    { skip: !userId },
  )
  const isCompleted = Boolean(result)

  const isToday = date === today
  const isFuture = date > today
  const hasChallenge = Boolean(challenge)
  const isAvailable = !isToday && hasChallenge && !isCompleted && !isFuture

  const params = { isToday, isCompleted, isLoading, isAvailable, isFuture, hasChallenge }
  const variant = getDailyChallengeVariant(params)

  const pt = getPoint(index)

  const middleWidth = 340 / 2
  const isLeft = pt.x < middleWidth

  const disabledVariant = [DAILY_CHALLENGES_VARIANTS.FUTURE, DAILY_CHALLENGES_VARIANTS.EMPTY, DAILY_CHALLENGES_VARIANTS.LOADING]

  const disabled = (disabledVariant as string[]).includes(variant)

  return (
    <div
      data-is-left={isLeft}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center flex-row data-[is-left=true]:flex-row-reverse gap-8"
      style={{ left: pt.x, top: pt.y }}
    >
      <PathNodeVisual {...{ variant, date, disabled, isToday, side: isLeft ? "left" : "right" }} />
    </div>
  )
})

PathNode.displayName = "PathNode"
