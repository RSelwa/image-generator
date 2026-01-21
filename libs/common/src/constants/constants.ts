export const USER_STATUS = {
  REGISTER: "Register",
  SUBSCRIBER: "Subscriber",
  STUDENT: "Student",
  TEACHER: "Teacher",
  COMPANY: "Company",
} as const

export const RIGHT_ROLES = {
  ADMIN: "Admin",
  COMMUNICATION: "Communication",
  COMMUNICATION_MANAGER: "Com-Manager",
  SALE: "Sale",
  ICONOGRAPH: "Iconograph",
  DATABASE_MANAGER: "Database-Manager",
  CURATOR: "Curator",
  BURANDE: "Burande",
  FASHION: "Fashion",
} as const

export const SUBSCRIPTION_TYPE = { BASIC: "BASIC", PRO: "PRO" } as const

export const INVITATION_TYPES = {
  ORGANIZATION: "organization",
  SCHOOL: "school",
  SINGLE: "single",
} as const

export const ORGANIZATION_TYPES = {
  COMPANY: "COMPANY",
  SCHOOL: "SCHOOL",
} as const

export const IS_PROD = process.env.GCLOUD_PROJECT === "flim-prod"

export const FLIM_API_BASE = IS_PROD
  ? "https://apiv2.flim.ai/2.0.0"
  : "https://dev-api.flim.ai/2.0.0"

export const FREE_TRIAL_ID = IS_PROD
  ? "bNLIU80pv2WM4CJ2i64P"
  : "YVohrTcm8hKWU2khYRUn"

export const DEFAULT_REFILL_CREDITS = 100

export const STATUS_GENERATION = {
  WAITING: "WAITING",
  PROCESSING: "PROCESSING",
  WORKING: "WORKING",
  QUEUED: "QUEUED",
  DONE: "DONE",
  ERROR: "ERROR",
} as const

export const BOARD_GEN_TYPE = {
  VIBE: "VIBE",
  STORYBOARD: "STORYBOARD",
} as const

export const SORT_TYPE = {
  AZ: "az",
  CREATED: "created",
  ADDED_AT: "addedAt",
  CUSTOM_ORDER: "customOrder",
} as const

export const ORDER_TYPE = {
  ASC: "asc",
  DESC: "desc",
} as const

export const SAFETY_VALUE = {
  NUDITY: "nudity",
  VIOLENCE: "violence",
} as const

export const MOTION_FILTER = {
  ZOOM: "zoom",
  PAN: "pan",
  ROTATE: "rotate",
  STATIC: "static",
} as const

export const QUERY_PARAM_PAN = {
  ALL: "all",
  RIGHT: "right",
  LEFT: "left",
  UP: "up",
  DOWN: "down",
} as const

export const QUERY_PARAM_ZOOM = {
  ALL: "all",
  IN: "in",
  OUT: "out",
} as const

export const QUERY_PARAM_ROTATE = {
  ALL: "all",
  CLOCKWISE: "clockwise",
  COUNTERCLOCKWISE: "counterclockwise",
} as const

export const CATEGORIES = {
  ADS: "ADS",
  MUSIC_VIDEOS: "MUSIC_VIDEOS",
  MOVIES: "MOVIES",
  DOCUMENTARIES: "DOCUMENTARIES",
  TVSERIES: "TVSERIES",
  TVEPISODES: "TVEPISODES",
} as const

export const AI_FEATURE_TYPE = {
  IMAGE_MIXING: "IMAGE_MIXING",
  STYLE_TRANSFER: "STYLE_TRANSFER",
  LORA: "LORA_GENERATION",
  EDIT_GEN: "IMAGE_EDITING",
  IMAGE_GEN: "IMAGE_GENERATION",
} as const

export const SOURCE_IMAGE = {
  FLIM: "FLIM",
  GENERATION: "GENERATION",
  UPLOAD: "UPLOAD",
} as const
