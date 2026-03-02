export const SOUNDS = {
  CORRECT: "/sounds/correct.mp3",
  WRONG: "/sounds/wrong.mp3",
  TICK: "/sounds/tick.mp3",
  ROUND_START: "/sounds/round-start.mp3",
  GAME_START: "/sounds/game-start.mp3",
  VICTORY: "/sounds/victory.mp3",
} as const

export type SoundKey = keyof typeof SOUNDS
