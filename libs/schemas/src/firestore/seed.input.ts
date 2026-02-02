import type z from "zod"
import { seedDocSchema } from "~/firestore/seed"

// Create seed input
export const createSeedInputSchema = seedDocSchema.omit({
  createdAt: true,
  updatedAt: true,
  timesUsed: true,
})
export type CreateSeedInput = z.infer<typeof createSeedInputSchema>

// Update seed input
export const updateSeedInputSchema = createSeedInputSchema.partial()
export type UpdateSeedInput = z.infer<typeof updateSeedInputSchema>
