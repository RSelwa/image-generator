import z from "zod"

export const gratitudeSchema = z.object({
  gratitude: z.array(z.string()).optional().default([]),
})

export type Gratitude = z.infer<typeof gratitudeSchema>
