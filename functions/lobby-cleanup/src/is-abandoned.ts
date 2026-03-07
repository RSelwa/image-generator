import { type Timestamp } from "firebase-admin/firestore"

const ONE_HOUR_MS = 60 * 60 * 1000
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const EARLY_ROUND_THRESHOLD = 3

export const isAbandoned = (createdAt: Timestamp, currentRound: number, config: { numberOfRounds: number, roundDuration: number }): boolean => {
  const now = Date.now()
  const createdAtMs = createdAt.toMillis()
  const elapsedMs = now - createdAtMs

  // If more than 1 hour has passed, check if the game could still be running
  if (elapsedMs > ONE_HOUR_MS) {
    const maxPossibleDurationMs = config.numberOfRounds * config.roundDuration * 1000
    // If max possible duration exceeds 1 hour (e.g. 24 rounds * 120s = 48min, but with delays could be longer),
    // only abandon if elapsed time exceeds the max possible duration + buffer
    if (maxPossibleDurationMs > ONE_HOUR_MS) {
      return elapsedMs > maxPossibleDurationMs + FIFTEEN_MINUTES_MS
    }

    return true
  }

  // If 15 minutes have passed and still in early rounds (1-2), it's abandoned
  if (elapsedMs > FIFTEEN_MINUTES_MS && currentRound < EARLY_ROUND_THRESHOLD) {
    return true
  }

  return false
}
