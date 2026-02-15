import { USER_RIGHT } from "@repo/common"
import { type User } from "firebase/auth"
import { z } from "zod"
import { SESSION_STATUS } from "@/constants/mapping"

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  photoUrl: z.string().nullish().transform((v) => v || ""),
  pseudo: z.string().nullish().transform((v) => v || ""),
  rights: z.enum(USER_RIGHT).nullish(),
  isAnonymous: z.boolean().default(false),
})

const authUserSchema = z.custom<User>()

export const sessionSchema = z.object({
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
