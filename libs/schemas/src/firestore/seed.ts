import { DIFFICULTIES } from "@repo/common"
import z from "zod"

import { roundSchema } from "~/firestore/seed.round"
import { timestampSchema, WITH_ID } from "../zod"

// Seed document - contains pre-generated rounds
export const seedDocSchema = z.object({
  name: z.string().optional().default(""), // Optional name for the seed
  rounds: z.array(roundSchema).min(1),
  difficulty: z.enum(Object.values(DIFFICULTIES) as [string, ...string[]]).optional(), // Overall difficulty filter used
  gameIds: z.array(z.string()).optional().default([]), // Games included (for filtering)
  isPublic: z.boolean().default(false), // Can be used by anyone
  createdBy: z.string().nullish().default(null), // User who created it
  timesUsed: z.number().default(0), // Track popularity
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const seedDocWithIdSchema = seedDocSchema.merge(WITH_ID)

export type SeedDoc = z.infer<typeof seedDocSchema>
export type SeedDocWithId = z.infer<typeof seedDocWithIdSchema>
