import z from "zod"

import { playerAnswerSchema } from "~/firestore/players.answers"
import { roundSchema } from "~/firestore/seed.round"
import { timestampSchema, WITH_ID } from "../zod"

// =============================================================================
// CLIENT-TRUST MODEL
// =============================================================================
// Clients write answers directly to Firestore for optimistic updates.
// They calculate isCorrect, points, and positionDistance locally.
// This prioritizes UX fluidity over cheat prevention (casual game).
// =============================================================================

// Round document - stores round data + player answers
// Collection: lobbies/{lobbyId}/roundAnswers/{roundIndex}
// At game start: copied from seed.rounds[]
// During game: clients write answers via arrayUnion
export const roundAnswerDocSchema = z.object({
  // Display fields
  ...roundSchema.pick({
    isSpecial: true,

    type: true,
    gameId: true,
    gameTitle: true,
    gameThumbnailUrl: true,

    sphericalId: true,
    sphericalImageUrl: true,

    flatId: true,
    flatImageUrl: true,

    mapId: true,
    mapPosition: true,
    mapImage: true,
    mapWidth: true,
    mapHeight: true,

    options: true,

    difficulty: true,
  }).shape,

  roundIndex: z.number().min(1), // 1-based index for easier client display
  // Player answers (clients write here via arrayUnion)
  answers: z.array(playerAnswerSchema).default([]),
  isComplete: z.boolean().default(false), // All players have answered
  createdAt: timestampSchema.nullish().default(() => null),
})

// Current round data = roundAnswerDoc without answer-related fields
// Used in lobby.currentRoundData for clients to display + validate
export const currentRoundDataSchema = roundAnswerDocSchema.omit({
  roundIndex: true,
  answers: true,
  isComplete: true,
  createdAt: true,
})

export type CurrentRoundData = z.infer<typeof currentRoundDataSchema>

export type RoundAnswerDoc = z.infer<typeof roundAnswerDocSchema>
export const roundAnswerDocWithIdSchema = roundAnswerDocSchema.merge(WITH_ID)
export type RoundAnswerDocWithId = z.infer<typeof roundAnswerDocWithIdSchema>
