import z from "zod"
import { gratitudeSchema } from "~/firestore/gratitude"
import { timestampSchema, WITH_ID } from "~/zod"

export const mapDocSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().nullish().default(null),
  width: z.number().positive().nullish().default(null),
  height: z.number().positive().nullish().default(null),
  gameId: z.string(), // For collectionGroup queries
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  maxDistancePoints: z.number().min(0).max(100).nullish().default(null),
  ...gratitudeSchema.shape,
})

export const mapDocWithIdSchema = z.object({
  ...mapDocSchema.shape,
  ...WITH_ID.shape,
})

export type MapDoc = z.infer<typeof mapDocSchema>
export type MapDocWithId = z.infer<typeof mapDocWithIdSchema>

// Input schemas for CRUD operations (without timestamps)
export const createMapInputSchema = mapDocSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const updateMapInputSchema = createMapInputSchema.partial()

export type CreateMapInput = z.infer<typeof createMapInputSchema>
export type UpdateMapInput = z.infer<typeof updateMapInputSchema>
