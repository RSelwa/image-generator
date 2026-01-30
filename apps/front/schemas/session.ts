import { SESSION_STATUS } from "@/constants/mapping"
import { USERS_RIGHTS } from "@repo/common"
import type { User } from "firebase/auth"
import { z } from "zod"

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  photoUrl: z.string(),
  rights: z.enum(USERS_RIGHTS).nullish().default(""),
})

const authUserSchema = z.custom<User>()

export const sessionSchema = z.object({
  disconnected: z.boolean(),
  token: z.string().nullable(),
  status: z.enum(SESSION_STATUS),
  authUser: authUserSchema.nullable(),
  user: z
    .object({
      ...sessionUserSchema.shape,
    })
    .nullable(),
})

export type Session = z.infer<typeof sessionSchema>
export type SessionUser = z.infer<typeof sessionUserSchema>
