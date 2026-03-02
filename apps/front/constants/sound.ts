export const SOUNDS = {
  CORRECT_GAME: "/sounds/game-valid.mp3",
  WRONG: "/sounds/wrong-answer.mp3",
  POINTS_COUNT: "/sounds/point-counts.mp3",
} as const

export type SoundKey = keyof typeof SOUNDS
