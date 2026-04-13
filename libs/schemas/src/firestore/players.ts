import { AVATARS_KEYS, DONOR_TIERS, getRandomAvatar } from "@repo/common"
import z from "zod"
import { timestampSchema } from "~/zod"

// Player in a lobby
export const playerSchema = z.object({
  uid: z.string().min(1),
  name: z.string(),
  avatar: z.enum(AVATARS_KEYS).transform((v) => v || getRandomAvatar()),
  score: z.number().default(0),
  isHost: z.boolean().default(false),
  isReady: z.boolean().default(false),
  joinedAt: timestampSchema.nullish().default(() => null),
  donorTier: z.enum(DONOR_TIERS).nullish().default(null),
})

export type Player = z.infer<typeof playerSchema>
