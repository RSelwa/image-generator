import z from "zod"
import { timestampSchema } from "~/zod"

export const soundDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),

  storagePath: z.string(),

  youtubeLink: z.string().optional(),
  youtubeId: z.string().optional(),
  youtubeTitle: z.string().optional(),

  canBeUsedInPosts: z.boolean().optional().default(false),
})
