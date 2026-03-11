export const ITEM_HEIGHT = 120
export const PATH_WIDTH = 340
export const PADDING_Y = 80
export const INITIAL_DAYS = 30
export const LOAD_MORE_DAYS = 30
export const NODE_SIZE = 64
export const ZIGZAG_X = [0.5, 0.22, 0.72, 0.3, 0.68, 0.18, 0.6, 0.38]
export const FIRST_DAY = "2026-03-01"

export const DAILY_CHALLENGES_VARIANTS = {
  TODAY: "TODAY", // pink checkmatk
  COMPLETED: "COMPLETED", // ready
  COMPLETED_TODAY: "COMPLETED_TODAY", // green checkmark
  AVAILABLE: "AVAILABLE", // Empty yellow square
  FUTURE: "FUTURE", // red locked
  EMPTY: "EMPTY", // gray with strips
  LOADING: "LOADING", // strips moving uprights
} as const

export const SIDE = {
  LEFT: "left",
  RIGHT: "right",
} as const
