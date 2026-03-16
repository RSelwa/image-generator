import { dateToString } from "@repo/common"
import { DAILY_CHALLENGES_VARIANTS, FIRST_DAY, ITEM_HEIGHT, PADDING_Y, PATH_WIDTH, ZIGZAG_X } from "@/constants/daily-challenges"

export const generateDates = (count: number): string[] => {
  const today = new Date()
  const dates: string[] = []

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowDate = dateToString(tomorrow)

  const inTwoDays = new Date(today)
  inTwoDays.setDate(today.getDate() + 2)
  const inTwoDaysDate = dateToString(inTwoDays)

  dates.push(inTwoDaysDate)
  dates.push(tomorrowDate)

  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const date = dateToString(d)
    if (date < FIRST_DAY) break
    dates.push(date)
  }

  return dates
}

export const getPoint = (index: number) => ({
  x: (ZIGZAG_X[index % ZIGZAG_X.length] || 0.5) * PATH_WIDTH,
  y: PADDING_Y + index * ITEM_HEIGHT,
})

export const buildPath = (count: number): string =>
  Array.from({ length: count }, (_, i) => getPoint(i)).reduce((acc, pt, i, pts) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = pts[i - 1]!
    const cy = ITEM_HEIGHT * 0.6

    return `${acc} C ${prev.x} ${prev.y + cy} ${pt.x} ${pt.y - cy} ${pt.x} ${pt.y}`
  }, "")

type ParamsVariant = {
  isToday: boolean
  isCompleted: boolean
  isLoading: boolean
  isAvailable: boolean
  isFuture: boolean
  hasChallenge: boolean
}

export const getVisualStreak = (streak: number, lastStreakDate: string): number => {
  if (!lastStreakDate || streak <= 0) return 0

  const today = dateToString(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = dateToString(yesterday)

  if (lastStreakDate === today || lastStreakDate === yesterdayStr) return streak

  return 0
}

export const getDailyChallengeVariant = (props: ParamsVariant) => {
  if (props.isLoading) return DAILY_CHALLENGES_VARIANTS.LOADING

  if (props.isCompleted && props.isToday) return DAILY_CHALLENGES_VARIANTS.COMPLETED_TODAY

  if (props.isCompleted) return DAILY_CHALLENGES_VARIANTS.COMPLETED

  if (props.isToday) return DAILY_CHALLENGES_VARIANTS.TODAY

  if (props.isAvailable) return DAILY_CHALLENGES_VARIANTS.AVAILABLE

  if (props.isFuture) return DAILY_CHALLENGES_VARIANTS.FUTURE

  if (!props.hasChallenge) return DAILY_CHALLENGES_VARIANTS.EMPTY

  return DAILY_CHALLENGES_VARIANTS.EMPTY
}
