import z from "zod"

export const userDocSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).optional().default(""),
})

export type UserDoc = z.infer<typeof userDocSchema>
