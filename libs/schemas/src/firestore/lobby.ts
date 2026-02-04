import { DEFAULT_LIVES, DEFAULT_NUMBERS_ROUNDS, DEFAULT_TIME_PER_ROUND, LOBBY_STATUS, MAX_PLAYERS } from "@repo/common"
import z from "zod"
import { lobbyConfigSchema } from "~/firestore/lobby.config"

import { playerSchema } from "~/firestore/players"
import { currentRoundDataSchema } from "~/firestore/round-answer"
import { timestampSchema, WITH_ID } from "~/zod"

// Main lobby document
export const lobbyDocSchema = z.object({
  code: z.string().min(4).max(6), // Join code (e.g., "ABC123")
  hostId: z.string().min(1),
  status: z.enum(Object.values(LOBBY_STATUS) as [string, ...string[]]).default(LOBBY_STATUS.WAITING),
  players: z.array(playerSchema).max(MAX_PLAYERS).default([]),
  config: lobbyConfigSchema.default({
    playersLives: DEFAULT_LIVES,
    maxPlayers: MAX_PLAYERS,
    roundDuration: DEFAULT_TIME_PER_ROUND,
    numberOfRounds: DEFAULT_NUMBERS_ROUNDS,
  }),
  seedId: z.string().nullish().default(null), // Reference to seed document (backend only)
  currentRound: z.number().default(0),
  currentRoundData: currentRoundDataSchema.nullish().default(null), // Safe data for clients
  roundStartedAt: timestampSchema.nullish().default(() => null),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export type LobbyDoc = z.infer<typeof lobbyDocSchema>
export const lobbyDocWithIdSchema = lobbyDocSchema.merge(WITH_ID)
export type LobbyDocWithId = z.infer<typeof lobbyDocWithIdSchema>

// Create lobby input (without auto-generated fields)
export const createLobbyInputSchema = lobbyDocSchema.omit({
  createdAt: true,
  updatedAt: true,
  currentRound: true,
  currentRoundData: true,
  roundStartedAt: true,
  seedId: true,
})
export type CreateLobbyInput = z.infer<typeof createLobbyInputSchema>

// Update lobby input
export const updateLobbyInputSchema = createLobbyInputSchema.partial()
export type UpdateLobbyInput = z.infer<typeof updateLobbyInputSchema>
