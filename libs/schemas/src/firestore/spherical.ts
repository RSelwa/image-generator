import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { timestampSchema, WITH_ID } from "~/zod"

// Position on the map (percentage 0-100)
export const mapPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

export const sphericalDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  gameId: z.string(),
  image: z.string().optional().default(""),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  status: z
    .enum(DOCUMENTS_STATUS)
    .optional()
    .default(DOCUMENTS_STATUS.WAITING),
  mapId: z.string().optional(), //* Sphericals with map
  mapPosition: mapPositionSchema.optional(), //* Sphericals with map
  thumbnail: z.string().optional(), // ? Sphericals with thumbnails
})

export const sphericalDocWithIdSchema = z.object({ ...sphericalDocSchema.shape, ...WITH_ID.shape })

// Input schemas for CRUD operations (without timestamps)
export const createSphericalInputSchema = sphericalDocSchema.omit({ createdAt: true, updatedAt: true })

export const updateSphericalInputSchema = createSphericalInputSchema.partial()

// Form schema (without gameId, added separately on submit)
export const sphericalFormSchema = createSphericalInputSchema.omit({ gameId: true })

export type MapPosition = z.infer<typeof mapPositionSchema>
export type SphericalDoc = z.infer<typeof sphericalDocSchema>
export type SphericalDocWithId = z.infer<typeof sphericalDocWithIdSchema>
export type CreateSphericalInput = z.infer<typeof createSphericalInputSchema>
export type UpdateSphericalInput = z.infer<typeof updateSphericalInputSchema>
export type SphericalFormInput = z.infer<typeof sphericalFormSchema>
