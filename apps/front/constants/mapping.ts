import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"

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
  REDIRECT: "redirect"
} as const

export const MODAL_KEYS = {
  GAME_ID: "game-id",
  SPHERICAL_ID: "spherical-id",
  MAPS_GALLERY_ID: "maps-gallery-id",
  MAP_ID: "map-id",
  SPHERICAL_GALLERY_ID: "spherical-gallery-id",
  FLAT_GALLERY_ID: "flat-gallery-id",
  FLAT_ID: "flat-id",
  CHANGE_PSEUDO: "new-pseudo",
  SEED_DETAIL: "seed-detail",
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
export const CONTACT_EMAIL = "selwa.raphael@gmail.com"

export const DIFFICULTIES_TO_BADGE_VARIANT = {
  [DIFFICULTIES.EASY]: "green",
  [DIFFICULTIES.MEDIUM]: "orange",
  [DIFFICULTIES.HARD]: "red",
} as const

export const STATUS_TO_BADGE_VARIANT = {
  [DOCUMENTS_STATUS.ERROR]: "red",
  [DOCUMENTS_STATUS.NEED_VERIFICATION]: "orange",
  [DOCUMENTS_STATUS.READY]: "green",
  [DOCUMENTS_STATUS.WAITING]: "neutral",
} as const

export const API_ENDPOINTS = {
  CREATE_SEED: "/api/create-seed",
  LEAVE_LOBBY: "/api/leave-lobby",
} as const

export const FIREBASE_ERRORS = {
  EMAIL_ALREADY_USED: "auth/email-already-in-use",
} as const
