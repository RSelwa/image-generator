import { AVATARS_KEYS } from "@repo/common"

export const IMAGES_URLS = {
  SIGNUP: "/signup.jpg",
  LOGIN: "/login.jpg",
  ANONYMOUS: "/anonymous-lobby-finished.jpg",
  ARTICLES: {
    MULTIPLAYER: "/articles/multiplayer.webp",
    SCENES: "/articles/scenes.webp",
    SPECIAL_ROUNDS: "/articles/special-rounds.webp",
    DAILY_CHALLENGES: "/pubs/daily-challenge.jpg",
    RACE: "/articles/race-mode.jpg",

  },
  PUBS: {
    DAILY_CHALLENGE: "/pubs/daily-challenge.jpg"
  }
} as const

export const AVATARS_URLS = {
  [AVATARS_KEYS.ASSASSIN]: "/avatar/blue-droid.png",
  [AVATARS_KEYS.DESTROYER]: "/avatar/blue-skeleton.png",
  [AVATARS_KEYS.RECON]: "/avatar/blue-smiley.png",
  [AVATARS_KEYS.ROOK]: "/avatar/golden-cat.png",
  [AVATARS_KEYS.THIEF]: "/avatar/pink-cat.png",
  [AVATARS_KEYS.TRIAGE]: "/avatar/pink-cow.png",
  [AVATARS_KEYS.VANDAL]: "/avatar/red-glyph.png",
  [AVATARS_KEYS.DONKEY]: "/avatar/glyph.png",
} as const

export const AVATARS_BACKGROUND_URLS = {
  PERIMETER: "/avatar_background/map_perimeter_overflow-Ck2U4HJE.jpg",
} as const

export const SVG_URLS = {
  STRIPS_MUTED: "/svg/stripe-blocks-muted.svg",
  DIAGONAL_STRIPS: "/svg/diagonal-stripes-muted.svg",
} as const
