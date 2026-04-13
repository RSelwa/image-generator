import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"
import z from "zod"
import { gratitudeSchema } from "~/firestore/gratitude"
import { mapPositionSchema } from "~/firestore/spherical"
import { timestampSchema, WITH_ID } from "~/zod"

export const flatDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  gameId: z.string(),
  image: z.string().optional().default(""),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  status: z
    .enum(DOCUMENTS_STATUS)
    .optional()
    .default(DOCUMENTS_STATUS.WAITING),
  mapId: z.string().optional(), //* Flats with map
  mapPosition: mapPositionSchema.optional(), //* Flats with map
  thumbnail: z.string().optional(),
  ...gratitudeSchema.shape,
})

export const flatDocWithIdSchema = z.object({ ...flatDocSchema.shape, ...WITH_ID.shape })

export const createFlatInputSchema = flatDocSchema.omit({ createdAt: true, updatedAt: true })

export const updateFlatInputSchema = createFlatInputSchema.partial()

export type FlatDoc = z.infer<typeof flatDocSchema>
export type FlatDocWithId = z.infer<typeof flatDocWithIdSchema>
export type CreateFlatInput = z.infer<typeof createFlatInputSchema>
export type UpdateFlatInput = z.infer<typeof updateFlatInputSchema>
