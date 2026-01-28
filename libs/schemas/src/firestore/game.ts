import type { DocumentReference } from "@firebase/firestore"
import { Timestamp } from "@firebase/firestore/lite"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { WITH_ID } from "~/zod"

export const gameDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().optional().default(""),
  storageImage: z.string().nullish(),
  midName: z.string().optional().default(""),
  alternateName: z.string().optional().default(""),
  hasSphericalImagesReady: z.boolean().optional().default(false),
  hasSpecialImagesReady: z.boolean().optional().default(false),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
})

export const gameDocWithIdSchema = z.object({
  ...gameDocSchema.shape,
  ...WITH_ID.shape,
})

export type GameDoc = z.infer<typeof gameDocSchema>
export type GameDocWithId = z.infer<typeof gameDocWithIdSchema>

export type GameRef = DocumentReference<GameDoc, GameDoc>
