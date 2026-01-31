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
  mapPosition: mapPositionSchema.nullish().default({ x: 50, y: 50 }),
  gameId: z.string(),
  image: z.string(),
  storageImage: z.string().nullish(),
  mosaics: z.array(z.string()).nullish(),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  status: z
    .enum(DOCUMENTS_STATUS)
    .nullish()
    .default(DOCUMENTS_STATUS.NEED_VERIFICATION),
  isValid: z.boolean().optional().default(false),
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

export const updateSphericalInputSchema = createSphericalInputSchema.partial()

export type CreateSphericalInput = z.infer<typeof createSphericalInputSchema>
export type UpdateSphericalInput = z.infer<typeof updateSphericalInputSchema>
