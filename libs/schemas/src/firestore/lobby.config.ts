import { DIFFICULTIES, MAX_PLAYERS } from "@repo/common"
import z from "zod"

// Lobby configuration
export const lobbyConfigSchema = z.object({
  maxPlayers: z.number().min(2).max(MAX_PLAYERS).default(MAX_PLAYERS),
  roundDuration: z.number().min(10).max(120).default(30), // seconds per round
  numberOfRounds: z.number().min(1).max(30).default(10),
  difficulty: z.enum(Object.values(DIFFICULTIES) as [string, ...string[]]).optional(),
})

export type LobbyConfig = z.infer<typeof lobbyConfigSchema>
