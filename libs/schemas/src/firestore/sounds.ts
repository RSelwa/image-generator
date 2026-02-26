import { SOUND_STATUS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const soundDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),

  status: z.enum(SOUND_STATUS).nullish().default(null),

  storagePath: z.string().optional(),

  youtubeLink: z.string().optional(),
  youtubeId: z.string().optional(),
  youtubeTitle: z.string().optional(),

  canBeUsedInPosts: z.boolean().optional().default(false),
})

export const soundDocWithIdSchema = z.object({
  ...soundDocSchema.shape,
  ...WITH_ID.shape,
})

export type SoundDoc = z.infer<typeof soundDocSchema>
export type SoundDocWithId = z.infer<typeof soundDocWithIdSchema>
