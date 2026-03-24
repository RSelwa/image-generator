import { DIFFICULTIES, DOCUMENTS_STATUS, DONOR_TIERS, SUGGESTIONS_TYPE } from "@repo/common"

export const IS_PLAYWRIGHT_EMULATOR = process.env.NEXT_PUBLIC_EMULATOR

export const SESSION_STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

export const QUERY_PARAMS = {
  SORT: "sort",
  SEARCH: "search",
  MISSING_IMAGE: "missing_image",
  LOBBY_CODE: "code",
  REDIRECT: "redirect",
  SUGGESTION_ID: "suggestion-id",
  SOCIAL_ID: "social-id",
  SOUND_ID: "social-id",
  USER_ID: "user-id",
  SPHERICAL_ID: "spherical-id",
  DAILY_CHALLENGE_DATE: "daily-challenge-date",
} as const

export const MODAL_KEYS = {
  GAME_ID: "game-id",
  EDIT_SPHERICAL_ID: "edit-spherical-id",
  MAPS_GALLERY_ID: "maps-gallery-id",
  MAP_ID: "map-id",
  SPHERICAL_GALLERY_ID: "spherical-gallery-id",
  SPHERICAL_ID: "spherical-id",
  FLAT_GALLERY_ID: "flat-gallery-id",
  FLAT_ID: "flat-id",
  CHANGE_PSEUDO: "new-pseudo",
  SEED_DETAIL: "seed-detail",
  SUGGEST_GAME: "suggest-game",
  REPORT_BUG: "report-bug",
  MAKE_SUGGESTION: "suggestion",
  NEW_SOCIALS: "new-socials",
  NEW_SOUND: "new-sound",
  NEW_DAILY_CHALLENGE: "new-daily-challenge",
} as const

export const SORT_OPTIONS = {
  TITLE_ASC: "title_asc",
  TITLE_DESC: "title_desc",
  CREATED_AT_ASC: "created_at_asc",
  CREATED_AT_DESC: "created_at_desc",
} as const

export const SORT_OPTIONS_LABEL = {
  [SORT_OPTIONS.TITLE_ASC]: "Title (A-Z)",
  [SORT_OPTIONS.TITLE_DESC]: "Title (Z-A)",
  [SORT_OPTIONS.CREATED_AT_ASC]: "Created At (Oldest)",
  [SORT_OPTIONS.CREATED_AT_DESC]: "Created At (Newest)",
} as const

export const NEW_SEARCH_PARAM = "new"
export const FALL_BACK_IMAGE = "/placeholder.svg"
export const APP_NAME = "Geo gamer"
export const CONTACT_EMAIL = "contact.geogamer@gmail.com"

export const BADGE_VARIANTS = {
  BLUE: "blue",
  GREEN: "green",
  ORANGE: "orange",
  RED: "red",
  NEUTRAL: "neutral",
  PURPLE: "purple",
  YELLOW: "yellow",
  PINK: "pink",
  LIME: "lime",
} as const

export const DIFFICULTIES_TO_BADGE_VARIANT = {
  [DIFFICULTIES.EASY]: BADGE_VARIANTS.GREEN,
  [DIFFICULTIES.MEDIUM]: BADGE_VARIANTS.ORANGE,
  [DIFFICULTIES.HARD]: BADGE_VARIANTS.RED,
} as const

export const STATUS_TO_BADGE_VARIANT = {
  [DOCUMENTS_STATUS.ERROR]: BADGE_VARIANTS.RED,
  [DOCUMENTS_STATUS.NEED_VERIFICATION]: BADGE_VARIANTS.ORANGE,
  [DOCUMENTS_STATUS.READY]: BADGE_VARIANTS.GREEN,
  [DOCUMENTS_STATUS.WAITING]: BADGE_VARIANTS.NEUTRAL,
} as const

export const RESOURCE_BADGE_VARIANT = {
  THUMBNAIL: BADGE_VARIANTS.BLUE,
  MAP: BADGE_VARIANTS.PURPLE,
} as const

export const SUGGESTIONS_TYPE_TO_BADGE_VARIANT = {
  [SUGGESTIONS_TYPE.BUG]: BADGE_VARIANTS.RED,
  [SUGGESTIONS_TYPE.GAME_SUGGESTIONS]: BADGE_VARIANTS.NEUTRAL,
  [SUGGESTIONS_TYPE.SUGGESTIONS]: BADGE_VARIANTS.NEUTRAL,
  [SUGGESTIONS_TYPE.HELP]: BADGE_VARIANTS.ORANGE,
} as const

export const API_ENDPOINTS = {
  CREATE_SEED: "/api/create-seed",
  DAILY_CHALLENGE: "/api/daily-challenge",
} as const

export const FIREBASE_ERRORS = {
  EMAIL_ALREADY_USED: "auth/email-already-in-use",
  CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use",
} as const

export const ASSET_URLS = {
  STRIP_ICONS: "/assets/left-icons.png",
  CREATOR_BACKGROUND: "/creator-background.svg",
  BOTTOM_GB: "/gb-br.png",
} as const

export const STORAGE_KEYS = {
  DRIVER_WAITING_ROOM: "driver_waiting_room",
  DRIVER_SPECIAL_ROUND: "driver_special_round",
} as const

export const LIMITED_MODAL_KEYS = {
  DAILY_CHALLENGE: "daily-challenge-v1",
  // NEW_FEATURE: "new-feature-v1",
} as const

export const LIMITED_MODAL_CONFIG: Record<string, { maxCount: number }> = {
  [LIMITED_MODAL_KEYS.DAILY_CHALLENGE]: { maxCount: 3 },
  // [LIMITED_MODAL_KEYS.NEW_FEATURE]: { maxCount: 3 },
}

export const MEMBERSHIPS_EVENTS = {
  STARTED: "membership.started",
  UPDATED: "membership.updated",
  CANCELLED: "membership.cancelled",
} as const

export const MEMBERSHIPS_ID = {
  [DONOR_TIERS.BRONZE]: 312700, // replace with actual ID
  [DONOR_TIERS.SILVER]: 312701, // replace with actual ID
  [DONOR_TIERS.GOLD]: 312702, // replace with actual ID
  // [DONOR_TIERS.GOLD]: 5, // For testing
} as const
