import z from "zod"

import { roundSchema } from "~/firestore/seed.round"
import { timestampSchema, WITH_ID } from "../zod"

// Seed document - contains pre-generated rounds
export const seedDocSchema = z.object({
  name: z.string().optional().default(""), // Optional name for the seed
  rounds: z.array(roundSchema).min(1),
  createdBy: z.string().nullish().default(null), // User who created it
  timesUsed: z.number().default(0), // Track popularity
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const seedDocWithIdSchema = z.object({
  ...seedDocSchema.shape,
  ...WITH_ID.shape,
})

export type SeedDoc = z.infer<typeof seedDocSchema>
export type SeedDocWithId = z.infer<typeof seedDocWithIdSchema>
