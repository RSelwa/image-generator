import { ROUND_TYPE } from "@repo/common"
import z from "zod"

// Option for special rounds (one of 4 images to choose from)
export const specialRoundOptionSchema = z.object({
  type: z.enum(ROUND_TYPE),
  gameId: z.string().min(1),
  gameTitle: z.string().min(1),
  gameAlternateNames: z.array(z.string()).nullish().default(null),
  gameThumbnailUrl: z.string().nullish().default(null),

  thumbnailUrl: z.string(), // Small thumbnails

  sphericalId: z.string().nullish().default(null), // If parent round type is "spherical"
  sphericalImage: z.string().nullish().default(null), // If parent round type is "spherical"

  flatId: z.string().nullish().default(null), // If parent round type is "flat"
  flatImage: z.string().nullish().default(null), // If parent round type is "flat"
})

export type SpecialRoundOption = z.infer<typeof specialRoundOptionSchema>
