import { USERS_RIGHTS } from "@repo/common"
import z from "zod"
import { WITH_ID } from "~/zod"

export const userDocSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).optional().default(""),
  rights: z.enum(USERS_RIGHTS).nullish(),
})

export const userDocWithIdSchema = z.object({
  ...userDocSchema.shape,
  ...WITH_ID.shape,
})

export type UserDoc = z.infer<typeof userDocSchema>
export type userDocSchemaWithId = z.infer<typeof userDocWithIdSchema>
