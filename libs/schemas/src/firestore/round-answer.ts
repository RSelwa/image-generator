import { ROUND_TYPE, SPECIAL_ROUND_OPTIONS_COUNT } from "@repo/common"
import z from "zod"

import { playerAnswerSchema } from "~/firestore/players.answers"
import { specialRoundOptionSchema } from "~/firestore/seed.option"
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
  isSpecial: z.boolean().default(false), // Special mode: 4 images, each player picks one

  // For normal rounds (isSpecial = false)
  imageUrl: z.string().nullish().default(null),
  thumbnailUrl: z.string().optional().default(""),
  correctGameId: z.string().nullish().default(null),
  correctGameTitle: z.string().nullish().default(null),

  // For special rounds (isSpecial = true) - 4 options to choose from
  // Each player picks one option, correctness depends on their selection
  options: z.array(specialRoundOptionSchema).length(SPECIAL_ROUND_OPTIONS_COUNT).nullish().default(null),

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
