import z from "zod"

export const gameDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().optional(),
})

export type GameDoc = z.infer<typeof gameDocSchema>
