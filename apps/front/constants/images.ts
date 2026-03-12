import { AVATARS_KEYS } from "@repo/common"

export const IMAGES_URLS = {
  SIGNUP: "/signup.jpg",
  LOGIN: "/login.jpg",
  ANONYMOUS: "/anonymous-lobby-finished.jpg",
  ARTICLES: {
    MULTIPLAYER: "/articles/multiplayer.webp",
    SCENES: "/articles/scenes.webp",
    SPECIAL_ROUNDS: "/articles/special-rounds.webp",
  },
} as const

export const AVATARS_URLS = {
  [AVATARS_KEYS.ASSASSIN]: "/avatar/kirby.png",
  [AVATARS_KEYS.DESTROYER]: "/avatar/mario.png",
  [AVATARS_KEYS.RECON]: "/avatar/toad.png",
  [AVATARS_KEYS.ROOK]: "/avatar/sonic.png",
  [AVATARS_KEYS.THIEF]: "/avatar/pikachu.png",
  [AVATARS_KEYS.TRIAGE]: "/avatar/ness.png",
  [AVATARS_KEYS.VANDAL]: "/avatar/penguin.png",
} as const

export const AVATARS_BACKGROUND_URLS = {
  PERIMETER: "/avatar_background/map_perimeter_overflow-Ck2U4HJE.jpg",
} as const

export const SVG_URLS = {
  STRIPS_MUTED: "/svg/stripe-blocks-muted.svg",
  DIAGONAL_STRIPS: "/svg/diagonal-stripes-muted.svg",
} as const
