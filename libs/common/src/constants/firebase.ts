export const PROJECT_ID = "tiktok-generator-fa261"

export const TABLES = {
  USERS: "users",
  GAMES: "games",
  MAPS: "maps",
  SPHERICAL: "spherical",
  FLAT: "flat",
  RIGHTS: "rights",
  LOBBIES: "lobbies",
  SEEDS: "seeds",
  ROUND_ANSWERS: "roundAnswers",
  SUGGESTIONS: "suggestions",
  METADATA: "metadata",
} as const

export const METADATA_DOCS = {
  GAMES_LIST: "gamesList",
} as const

export const STORAGE_PATHS = {
  GAME_THUMBNAILS: "game-thumbnails",
  SPHERICALS: "sphericals",
  MAP_IMAGES: "map-thumbnails",
  FLAT_IMAGES: "flat-images",
  FLAT_THUMBNAILS: "flat-thumbnails",
  SUGGESTIONS: "suggestions"
} as const

export const USER_RIGHT = {
  ADMIN: "admin",
  ICONOGRAPH: "iconograph",
} as const

export const BUCKETS_ACTIONS = {
  CREATE: "create",
  UPDATE: "DELETE",
  DELETE: "delete"
} as const

export const RIGHTS_CREATE_TO_BUCKETS = {
  [STORAGE_PATHS.GAME_THUMBNAILS]: [{
    role:
      USER_RIGHT.ADMIN,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE, BUCKETS_ACTIONS.DELETE],
  }, {
    role:
        USER_RIGHT.ICONOGRAPH,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE],
  }],
  [STORAGE_PATHS.SPHERICALS]: [{
    role:
      USER_RIGHT.ADMIN,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE, BUCKETS_ACTIONS.DELETE],
  }, {
    role:
        USER_RIGHT.ICONOGRAPH,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE],
  }],
  [STORAGE_PATHS.MAP_IMAGES]: [{
    role:
      USER_RIGHT.ADMIN,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE, BUCKETS_ACTIONS.DELETE],
  }, {
    role:
        USER_RIGHT.ICONOGRAPH,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE],
  }],
  [STORAGE_PATHS.FLAT_IMAGES]: [{
    role:
      USER_RIGHT.ADMIN,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE, BUCKETS_ACTIONS.DELETE],
  }, {
    role:
        USER_RIGHT.ICONOGRAPH,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE],
  }],
  [STORAGE_PATHS.FLAT_THUMBNAILS]: [{
    role:
      USER_RIGHT.ADMIN,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE, BUCKETS_ACTIONS.DELETE],
  }, {
    role:
        USER_RIGHT.ICONOGRAPH,
    rights: [BUCKETS_ACTIONS.CREATE, BUCKETS_ACTIONS.UPDATE],
  }],
} as const
