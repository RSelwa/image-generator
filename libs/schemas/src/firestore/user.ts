import { USERS_RIGHTS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const userDocSchema = z.object({
  email: z.email(),
  name: z.string().nullish().default(""),
  rights: z.enum(USERS_RIGHTS).nullish(),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const userDocWithIdSchema = z.object({
  ...userDocSchema.shape,
  ...WITH_ID.shape,
})

export type UserDoc = z.infer<typeof userDocSchema>
export type userDocSchemaWithId = z.infer<typeof userDocWithIdSchema>
