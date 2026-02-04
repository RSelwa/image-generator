import z from "zod"

// Option for special rounds (one of 4 images to choose from)
export const specialRoundOptionSchema = z.object({
  thumbnailUrl: z.string().min(1),
  gameId: z.string().min(1),
  gameTitle: z.string().min(1),
  sphericalId: z.string().nullish().default(null), // If parent round type is "spherical"
  flatId: z.string().nullish().default(null), // If parent round type is "flat"
})

export type SpecialRoundOption = z.infer<typeof specialRoundOptionSchema>
