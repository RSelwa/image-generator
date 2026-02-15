import { DIFFICULTIES, ROUND_TYPE, SPECIAL_ROUND_OPTIONS_COUNT } from "@repo/common"
import z from "zod"
import { specialRoundOptionSchema } from "~/firestore/seed.option"
import { mapPositionSchema } from "~/firestore/spherical"

// Single round within a seed
export const roundSchema = z.object({
  isSpecial: z.boolean().default(false), // Special mode: 4 images, each player picks one

  // For normal rounds (isSpecial = false)
  type: z.enum(ROUND_TYPE).optional(),
  gameId: z.string().nullish().default(null), // The game to guess
  gameTitle: z.string().nullish().default(null), // Cached for quick access
  gameAlternateNames: z.array(z.string()).nullish().default(null), // Cached for quick access
  gameThumbnailUrl: z.string().nullish().default(null), // Cached for quick access

  sphericalId: z.string().nullish().default(null), // If type is "spherical"
  sphericalImageUrl: z.string().nullish().default(null), // Pre-resolved image URL

  flatId: z.string().nullish().default(null), // If type is "flat"
  flatImageUrl: z.string().nullish().default(null), // Pre-resolved image URL

  mapId: z.string().nullish().default(null), // Optional map context
  mapPosition: mapPositionSchema.nullish().default(null),
  mapImage: z.string().nullish().default(null),
  mapWidth: z.number().positive().nullish().default(null),
  mapHeight: z.number().positive().nullish().default(null),
  maxDistancePoints: z.number().min(0).max(100).nullish().default(null), // Max distance (%) beyond which 0 points

  // For special rounds (isSpecial = true) - 4 options to choose from
  options: z.array(specialRoundOptionSchema).length(SPECIAL_ROUND_OPTIONS_COUNT).nullish().default(null),

  // Common fields
  difficulty: z.enum(DIFFICULTIES).default(DIFFICULTIES.EASY),

})

export type Round = z.infer<typeof roundSchema>
