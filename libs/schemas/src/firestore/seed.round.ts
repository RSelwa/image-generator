import { DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import z from "zod"
import { mapPositionSchema } from "~/firestore/spherical"

// Single round within a seed
export const roundSchema = z.object({
  type: z.enum(Object.values(ROUND_TYPE) as [string, ...string[]]),
  gameId: z.string().min(1), // The game to guess
  gameTitle: z.string().min(1), // Cached for quick access
  sphericalId: z.string().nullish().default(null), // If type is "spherical"
  flatId: z.string().nullish().default(null), // If type is "flat"
  imageUrl: z.string().min(1), // Pre-resolved image URL
  thumbnailUrl: z.string().optional().default(""),
  difficulty: z.enum(Object.values(DIFFICULTIES) as [string, ...string[]]).default(DIFFICULTIES.EASY),
  mapId: z.string().nullish().default(null), // Optional map context
  mapPosition: mapPositionSchema
    .nullish()
    .default(null),
})

export type Round = z.infer<typeof roundSchema>
