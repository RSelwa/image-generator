import { ROUND_TYPE } from "@repo/common"
import z from "zod"

import { playerAnswerSchema } from "~/firestore/players.answers"
import { mapPositionSchema } from "~/firestore/spherical"
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
  roundIndex: z.number().min(0),

  // Display fields
  type: z.enum(Object.values(ROUND_TYPE) as [string, ...string[]]),
  imageUrl: z.string().min(1),
  thumbnailUrl: z.string().optional().default(""),

  // Correct answer
  correctGameId: z.string().min(1),
  correctGameTitle: z.string().min(1),

  // Map data (if round has a map)
  hasMap: z.boolean().default(false),
  mapId: z.string().nullish().default(null),
  mapImageUrl: z.string().nullish().default(null),
  correctPosition: mapPositionSchema.nullish().default(null),

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
