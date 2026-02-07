import z from "zod"
import { mapPositionSchema } from "~/firestore/spherical"
import { timestampSchema } from "~/zod"

// Player's answer (written directly by client via arrayUnion)
export const playerAnswerSchema = z.object({
  uid: z.string().min(1),
  playerName: z.string().min(1),

  // Game guess
  answer: z.string().default(""), // The game title they guessed
  isCorrect: z.boolean().default(false), // Calculated by client

  // For special rounds: which of the 4 images they selected (0-3)
  selectedOptionIndex: z.number().min(0).max(3).nullish().default(null),

  // Map position guess (only if round has a map)
  position: mapPositionSchema.nullish().default(null),
  positionDistance: z.number().nullish().default(null), // Calculated by client

  // Scoring (all calculated by client)
  timeMs: z.number().default(0), // Time taken in milliseconds
  gamePoints: z.number().default(0), // Points from guessing the game name
  distancePoints: z.number().default(0), // Points from map distance
  points: z.number().default(0), // Total points earned this round
  submittedAt: timestampSchema.nullish().default(() => null),
  isReadyForNextRound: z.boolean().default(false),
})

export type PlayerAnswer = z.infer<typeof playerAnswerSchema>
