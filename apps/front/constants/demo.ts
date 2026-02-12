import { DEFAULT_LIVES, DEFAULT_TIME_PER_ROUND } from "@repo/common"

export const DEMO_SEED_ID = "" // Set this to a valid seed ID from Firestore

export const DEMO_MODE: "full" | "simplified" = "full"

export const DEMO_CONFIG = {
  roundDuration: DEFAULT_TIME_PER_ROUND,
  playersLives: DEMO_MODE === "full" ? DEFAULT_LIVES : null,
} as const
