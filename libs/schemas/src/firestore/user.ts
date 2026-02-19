import { AVATARS_KEYS, getRandomAvatar, USERS_FIELDS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const userDocSchema = z.object({
  email: z.email(),
  pseudo: z.string().min(3).max(30).nullish().default(""),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  avatar: z.enum(AVATARS_KEYS).nullish().default(getRandomAvatar()),
  [USERS_FIELDS.IS_ANONYMOUS_USER]: z.boolean().nullish().default(false),
})

export const userDocWithIdSchema = z.object({
  ...userDocSchema.shape,
  ...WITH_ID.shape,
})

export type UserDoc = z.infer<typeof userDocSchema>
export type userDocWithId = z.infer<typeof userDocWithIdSchema>
