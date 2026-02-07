import z from "zod"
import { timestampSchema } from "~/zod"

// Player in a lobby
export const playerSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().optional().default(""),
  score: z.number().default(0),
  livesUsed: z.number().default(0),
  isHost: z.boolean().default(false),
  isReady: z.boolean().default(false),
  joinedAt: timestampSchema.nullish().default(() => null),
})

export type Player = z.infer<typeof playerSchema>
