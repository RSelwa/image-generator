import type { DocumentReference } from "@firebase/firestore"
import z from "zod"
import { WITH_ID } from "~/zod"

export const gameDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().optional().default(""),
  midName: z.string().optional().default(""),
  alternateName: z.string().optional().default(""),
})

export const gameDocSchemaWithId = z.object({
  ...gameDocSchema.shape,
  ...WITH_ID.shape,
})

export type GameDoc = z.infer<typeof gameDocSchema>
export type GameDocWithId = z.infer<typeof gameDocSchemaWithId>

export type GameRef = DocumentReference<GameDoc, GameDoc>
