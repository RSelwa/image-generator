import { DEFAULT_NUMBERS_ROUNDS, DEFAULT_TIME_PER_ROUND, DIFFICULTIES, MAX_PLAYERS } from "@repo/common"
import z from "zod"

// Lobby configuration
export const lobbyConfigSchema = z.object({
  playersLives: z.number().nullish().default(null),
  maxPlayers: z.number().min(2).max(MAX_PLAYERS).default(MAX_PLAYERS),
  roundDuration: z.number().min(10).max(120).default(DEFAULT_TIME_PER_ROUND), // seconds per round
  numberOfRounds: z.number().min(1).max(30).default(DEFAULT_NUMBERS_ROUNDS),
  difficulty: z.enum(DIFFICULTIES).optional(),
})

export type LobbyConfig = z.infer<typeof lobbyConfigSchema>
