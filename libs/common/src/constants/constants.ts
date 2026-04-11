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
export const DEMO_SEED_ID = "CjHaxLqAr11k8l3LJv5l"
export const DEFAULT_NUMBERS_ROUNDS = 12
export const NUMBER_OF_ROUNDS_PER_STAGE = 6
export const MAX_PLAYERS = 8
export const DEFAULT_TIME_PER_ROUND = 60 // seconds
export const SPECIAL_ROUND_OPTIONS_COUNT = 4 // round options count for special rounds
export const DEFAULT_LIVES = 3
export const DEFAULT_MAX_DISTANCE_POINTS = 50 // percentage of max distance - Old value : 30
export const DEFAULT_HAS_SPECIAL_ROUNDS = true

export const LOBBY_MODES = {
  FULL: "full",
  GAME_ONLY: "game-only",
  MAP_ONLY: "map-only",
} as const

export const DEFAULT_LOBBY_MODE = LOBBY_MODES.FULL
export const MAX_RECENT_LOBBIES_TO_EXCLUDE = 3

export const PREFIX_ANONYMOUS_USER = "anon_"
export const SUFFIX_ANONYMOUS_USER = "@demo.geogamer"

export const APP_BASE_URL = "https://geo-gamer.net"
export const AUDIO_EXTRACT_ENDPOINT = "https://audio-extraction-79796269085.us-central1.run.app"
export const UMA_STUDIO_URL = "https://uma-studio.fr/"

export const OPTIONS_NUMBER_OF_ROUNDS = [1, 2, 3, 4].map((multiplier) => multiplier * NUMBER_OF_ROUNDS_PER_STAGE)
export const OPTIONS_PLAYERS_LIVES = [null, 1, 3, 5]
export const OPTIONS_ROUND_DURATIONS = [30, 60, 90, 120]

export const RACE_STATUS = {
  WAITING: "waiting",
  STARTING: "starting",
  PLAYING: "playing",
  FINISHED: "finished",
} as const

export const RACE_DURATION_SECONDS = 300 // 5 minutes

export const DEATH_RUN_STATUS = {
  WAITING: "waiting",
  STARTING: "starting",
  PLAYING: "playing",
  FINISHED: "finished",
} as const

export const DEATH_RUN_LIVES = 3
export const DEATH_RUN_MAX_REVIVES = 1
export const DEATH_RUN_POINTS_PER_ANSWER = 1
export const DEATH_RUN_SEED_EXTENSION_THRESHOLD = 3
export const RACE_SEED_EXTENSION_THRESHOLD = 3 // extend seed when this many rounds remain ahead
export const RACE_SEED_ROUNDS_PER_EXTENSION = 20 // number of rounds to add per extension
export const RACE_SEED_IMAGE_FETCH_LIMIT = 50 // images fetched per type (spherical/flat) per extension
export const RACE_POINTS_PER_ANSWER = 100 // flat points per correct answer
export const RACE_POINTS_PER_WRONG_ANSWER = -50 // flat points per correct answer

export const LOBBY_STATUS = {
  WAITING: "waiting",
  STARTING: "starting",
  PLAYING: "playing",
  FINISHED: "finished",
  ABANDONED: "abandoned",
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

export const SUGGESTIONS_TYPE = {
  BUG: "bug",
  GAME_SUGGESTIONS: "game_suggestion",
  SUGGESTIONS: "suggestions",
  HELP: "help"
} as const

export const AVATARS_KEYS = {
  ASSASSIN: "assassin",
  DESTROYER: "destroyer",
  RECON: "recon",
  ROOK: "rook",
  THIEF: "thief",
  TRIAGE: "triage",
  VANDAL: "vandal",
  DONKEY: "donkey"
} as const

export const SOUND_STATUS = {
  DRAFT: "draft",
  WAITING_FOR_EXTRACTION: "waiting_for_extraction",
  PENDING: "pending",
  PROCESSED: "processed",
  ERROR: "error",
} as const
