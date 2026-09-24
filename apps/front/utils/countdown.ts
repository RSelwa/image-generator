const MS_PER_SECOND = 1_000
const SECONDS_PER_MINUTE = 60

export const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / MS_PER_SECOND))
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE

  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
