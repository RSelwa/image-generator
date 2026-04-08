import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const MESSAGE_TARGET_TYPE = ["user", "lobby"] as const

export const messageDocSchema = z.object({
  content: z.string().min(1),
  targetType: z.enum(MESSAGE_TARGET_TYPE),
  targetId: z.string().min(1),
  seenBy: z.array(z.string()).default([]),
  createdAt: timestampSchema.nullish().default(() => null),
})

export const messageDocWithIdSchema = z.object({
  ...messageDocSchema.shape,
  ...WITH_ID.shape,
})

export type MessageDoc = z.infer<typeof messageDocSchema>
export type MessageDocWithId = z.infer<typeof messageDocWithIdSchema>
