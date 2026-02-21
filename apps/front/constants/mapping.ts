import { AVATARS_KEYS, DIFFICULTIES, DOCUMENTS_STATUS, SUGGESTIONS_TYPE } from "@repo/common"

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
  USER_ID: "user-id",
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
  SUGGEST_GAME: "suggest-game",
  REPORT_BUG: "report-bug",
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

const BADGE_VARIANTS = {
  GREEN: "green",
  ORANGE: "orange",
  RED: "red",
  NEUTRAL: "neutral",
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

export const SUGGESTIONS_TYPE_TO_BADGE_VARIANT = {
  [SUGGESTIONS_TYPE.BUG]: BADGE_VARIANTS.RED,
  [SUGGESTIONS_TYPE.SUGGESTIONS]: BADGE_VARIANTS.NEUTRAL,
  [SUGGESTIONS_TYPE.HELP]: BADGE_VARIANTS.ORANGE,
} as const

export const API_ENDPOINTS = {
  CREATE_SEED: "/api/create-seed",
  LEAVE_LOBBY: "/api/leave-lobby",
} as const

export const FIREBASE_ERRORS = {
  EMAIL_ALREADY_USED: "auth/email-already-in-use",
  CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use",
} as const

export const ASSET_URLS = {
  STRIP_ICONS: "/assets/left-icons.png",
  CREATOR_BACKGROUND: "/creator-background.svg",
  BOTTOM_GB:"/gb-br.png",
} as const

export const AVATARS_URLS = {
  [AVATARS_KEYS.ASSASSIN]: "/avatar/runner_assassin_icon-CQczza6i.png",
  [AVATARS_KEYS.DESTROYER]: "/avatar/runner_destroyer_icon-BNsj7jDO.png",
  [AVATARS_KEYS.RECON]: "/avatar/runner_recon_icon-DcxTFu9p.png",
  [AVATARS_KEYS.ROOK]: "/avatar/runner_rook_icon-C12uL7F1.png",
  [AVATARS_KEYS.THIEF]: "/avatar/runner_thief_icon-DwN1CDwF.png",
  [AVATARS_KEYS.TRIAGE]: "/avatar/runner_triage_icon-BgDnRG_N.png",
  [AVATARS_KEYS.VANDAL]: "/avatar/runner_vandal_icon-FzjQgJ8c.png",
} as const

export const AVATARS_BACKGROUND_URLS = {
  PERIMETER: "/avatar_background/map_perimeter_overflow-Ck2U4HJE.jpg",
} as const

export const STORAGE_KEYS = {
  DRIVER_WAITING_ROOM: "driver_waiting_room",
} as const