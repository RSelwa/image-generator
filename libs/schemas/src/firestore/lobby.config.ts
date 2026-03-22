import { DEFAULT_HAS_SPECIAL_ROUNDS, DEFAULT_LOBBY_MODE, DEFAULT_NUMBERS_ROUNDS, DEFAULT_TIME_PER_ROUND, DIFFICULTIES, LOBBY_MODES, MAX_PLAYERS } from "@repo/common"
import z from "zod"

// Lobby configuration
export const lobbyConfigSchema = z.object({
  playersLives: z.number().nullish().default(null),
  maxPlayers: z.number().min(1).max(MAX_PLAYERS).default(MAX_PLAYERS),
  roundDuration: z.number().min(10).max(120).default(DEFAULT_TIME_PER_ROUND), // seconds per round
  numberOfRounds: z.number().min(1).max(30).default(DEFAULT_NUMBERS_ROUNDS),
  hasSpecialRounds: z.boolean().default(DEFAULT_HAS_SPECIAL_ROUNDS),
  difficulty: z.enum(DIFFICULTIES).optional(),
  mode: z.enum(LOBBY_MODES).default(DEFAULT_LOBBY_MODE),
})

export type LobbyConfig = z.infer<typeof lobbyConfigSchema>
