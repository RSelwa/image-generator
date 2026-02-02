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

  // Map position guess (only if round has a map)
  position: mapPositionSchema.nullish().default(null),
  positionDistance: z.number().nullish().default(null), // Calculated by client

  // Scoring (all calculated by client)
  timeMs: z.number().default(0), // Time taken in milliseconds
  points: z.number().default(0), // Total points earned this round
  submittedAt: timestampSchema.nullish().default(() => null),
})

export type PlayerAnswer = z.infer<typeof playerAnswerSchema>
