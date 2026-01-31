import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { timestampSchema, WITH_ID } from "~/zod"

// Position on the map (percentage 0-100)
export const mapPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

export type MapPosition = z.infer<typeof mapPositionSchema>

export const sphericalDocSchema = z.object({
  gameRef: z.string(),
  mapId: z.string().nullish(),
  mapPosition: mapPositionSchema.optional(),
  gameId: z.string(),
  image: z.string().optional().default(""),
  mosaics: z.array(z.string()).nullish(),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  status: z
    .enum(DOCUMENTS_STATUS)
    .optional()
    .default(DOCUMENTS_STATUS.WAITING),
})

export const sphericalDocWithIdSchema = z.object({
  ...sphericalDocSchema.shape,
  ...WITH_ID.shape,
})

export type SphericalDoc = z.infer<typeof sphericalDocSchema>
export type SphericalDocWithId = z.infer<typeof sphericalDocWithIdSchema>

// Input schemas for CRUD operations (without timestamps)
export const createSphericalInputSchema = sphericalDocSchema.omit({
  createdAt: true,
  updatedAt: true,
})

// Update schema without defaults to avoid overwriting existing values
export const updateSphericalInputSchema = z
  .object({
    gameRef: z.string(),
    mapId: z.string().nullish(),
    mapPosition: mapPositionSchema.optional(),
    gameId: z.string(),
    image: z.string(),
    mosaics: z.array(z.string()).nullish(),
    difficulty: z.enum(DIFFICULTIES),
    status: z.enum(DOCUMENTS_STATUS),
  })
  .partial()

export type CreateSphericalInput = z.infer<typeof createSphericalInputSchema>
export type UpdateSphericalInput = z.infer<typeof updateSphericalInputSchema>
