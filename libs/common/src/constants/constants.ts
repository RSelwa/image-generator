export const DIFFICULTIES = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const

export const DOCUMENTS_STATUS = {
  WAITING: "waiting",
  ERROR: "error",
  NEED_VERIFICATION: "need_verification",
  READY: "ready",
} as const

// Multiplayer game constants
export const DEFAULT_NUMBERS_ROUNDS = 18
export const MAX_PLAYERS = 8
export const DEFAULT_TIME_PER_ROUND = 60 // seconds
export const SPECIAL_ROUND_OPTIONS_COUNT = 4 // seconds
export const DEFAULT_LIVES = 3
export const DEFAULT_MAX_DISTANCE_POINTS = 30 // percentage of max distance

export const LOBBY_STATUS = {
  WAITING: "waiting",
  STARTING: "starting",
  PLAYING: "playing",
  FINISHED: "finished",
} as const

export const ROUND_TYPE = {
  SPHERICAL: "spherical",
  FLAT: "flat",
} as const

export const ROUND_POINTS = {
  GAME_GUESS: 100,
  DISTANCE: 100,
  DISTANCE_ADDITION: 50,
  DISTANCE_SNAP_THRESHOLD: 10, // If within this many points of max, snap to max
} as const
