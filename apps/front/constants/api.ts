export const DEFAULT_SIZE_GAMES = 150
export const DEFAULT_SIZE_SPHERICALS = 20
export const DEFAULT_SIZE_MAPS = 100

export const ENDPOINTS_BASE = {
  UPLOAD_IMAGE: "/api/upload-image",
  PROXY_IMAGE: "/api/proxy-image",
} as const

export const UPLOAD_GAME_IMAGE_PAYLOAD = {
  FILE: "file",
  GAME_ID: "gameId",
  GAME_NAME: "gameName",
}

export const URL_DEV_TEST = "http://localhost:8000"
