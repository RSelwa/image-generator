import { USER_RIGHT } from "@repo/common"
import z from "zod"

export const rightDocSchema = z.object({
  uid: z.string(),
  right: z.enum(USER_RIGHT),
  info: z.string().optional(),
})

export type RightDoc = z.infer<typeof rightDocSchema>
