import z from "zod"

import { roundSchema } from "~/firestore/seed.round"
import { timestampSchema, WITH_ID } from "~/zod"

export const dailyChallengeDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")

export const dailyChallengeDocSchema = roundSchema
  .pick({
    // Image
    sphericalId: true,
    sphericalImageUrl: true,
    flatId: true,
    flatImageUrl: true,
    // Map
    mapId: true,
    mapImage: true,
    mapPosition: true,
    mapWidth: true,
    mapHeight: true,
    maxDistancePoints: true,
    // Common
    difficulty: true,
  })
  .extend({
    date: dailyChallengeDateSchema, // YYYY-MM-DD = doc ID, sorts lexicographically

    isSpherical: z.boolean(),

    // Required in daily challenge (nullish in roundSchema)
    gameId: z.string(),
    gameTitle: z.string(),
    gameAlternateNames: z.array(z.string()).default([]),

    createdBy: z.string(),
    createdAt: timestampSchema.nullish().default(() => null),
  })

export const dailyChallengeDocWithIdSchema = z.object({ ...dailyChallengeDocSchema.shape, ...WITH_ID.shape })

export type DailyChallengeDoc = z.infer<typeof dailyChallengeDocSchema>
export type DailyChallengeDocWithId = z.infer<typeof dailyChallengeDocWithIdSchema>

export const createDailyChallengeInputSchema = dailyChallengeDocSchema.omit({ createdAt: true })
export const updateDailyChallengeInputSchema = createDailyChallengeInputSchema.partial()

export type CreateDailyChallengeInput = z.infer<typeof createDailyChallengeInputSchema>
export type UpdateDailyChallengeInput = z.infer<typeof updateDailyChallengeInputSchema>
