import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const conversationDocSchema = z.object({
  participants: z.array(z.string().min(1)).min(1),
  lastMessage: z.string().default(""),
  lastMessageAt: timestampSchema.nullish().default(() => null),
  createdAt: timestampSchema.nullish().default(() => null),
  lobbyId: z.string().optional(),
})

export const conversationDocWithIdSchema = z.object({
  ...conversationDocSchema.shape,
  ...WITH_ID.shape,
})

export const conversationMessageDocSchema = z.object({
  content: z.string().min(1),
  senderId: z.string().min(1),
  seenBy: z.array(z.string()).default([]),
  createdAt: timestampSchema.nullish().default(() => null),
})

export const conversationMessageDocWithIdSchema = z.object({
  ...conversationMessageDocSchema.shape,
  ...WITH_ID.shape,
})

export type ConversationDoc = z.infer<typeof conversationDocSchema>
export type ConversationDocWithId = z.infer<typeof conversationDocWithIdSchema>
export type ConversationMessageDoc = z.infer<typeof conversationMessageDocSchema>
export type ConversationMessageDocWithId = z.infer<typeof conversationMessageDocWithIdSchema>
