import { DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import z from "zod"
import { specialRoundOptionSchema } from "~/firestore/seed.option"
import { mapPositionSchema } from "~/firestore/spherical"

// Single round within a seed
export const roundSchema = z.object({
  type: z.enum(Object.values(ROUND_TYPE) as [string, ...string[]]),
  isSpecial: z.boolean().default(false), // Special mode: 4 images, each player picks one

  // For normal rounds (isSpecial = false)
  gameId: z.string().nullish().default(null), // The game to guess
  gameTitle: z.string().nullish().default(null), // Cached for quick access
  sphericalId: z.string().nullish().default(null), // If type is "spherical"
  flatId: z.string().nullish().default(null), // If type is "flat"
  imageUrl: z.string().nullish().default(null), // Pre-resolved image URL
  thumbnailUrl: z.string().optional().default(""),

  // For special rounds (isSpecial = true) - 4 options to choose from
  options: z.array(specialRoundOptionSchema).length(4).nullish().default(null),

  // Common fields
  difficulty: z.enum(Object.values(DIFFICULTIES) as [string, ...string[]]).default(DIFFICULTIES.EASY),
  mapId: z.string().nullish().default(null), // Optional map context
  mapPosition: mapPositionSchema.nullish().default(null),
})

export type Round = z.infer<typeof roundSchema>
