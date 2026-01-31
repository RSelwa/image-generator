import { type DocumentReference } from "@firebase/firestore"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { timestampSchema, WITH_ID } from "~/zod"

export const gameDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().optional().default(""),
  storageImage: z.string().nullish(),
  midName: z.string().optional().default(""),
  alternateName: z.string().optional().default(""),
  hasSphericalImagesReady: z.boolean().optional().default(false),
  hasSpecialImagesReady: z.boolean().optional().default(false),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
})

export const gameDocWithIdSchema = z.object({
  ...gameDocSchema.shape,
  ...WITH_ID.shape,
})

export type GameDoc = z.infer<typeof gameDocSchema>
export type GameDocWithId = z.infer<typeof gameDocWithIdSchema>

// Input schemas for CRUD operations (without timestamps)
export const createGameInputSchema = gameDocSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const updateGameInputSchema = createGameInputSchema.partial()

export type CreateGameInput = z.infer<typeof createGameInputSchema>
export type UpdateGameInput = z.infer<typeof updateGameInputSchema>

export type GameRef = DocumentReference<GameDoc, GameDoc>
