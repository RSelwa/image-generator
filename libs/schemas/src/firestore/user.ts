import { USERS_RIGHTS } from "@repo/common"
import z from "zod"

export const userDocSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).optional().default(""),
  rights: z.array(z.enum(USERS_RIGHTS)).optional().default([]),
})

export type UserDoc = z.infer<typeof userDocSchema>
