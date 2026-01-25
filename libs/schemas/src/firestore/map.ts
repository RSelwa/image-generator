import { DocumentReference } from "@firebase/firestore"
import z from "zod"
import type { GameRef } from "~/firestore/game"
import { WITH_ID } from "~/zod"

export const mapDocSchema = z.object({
  title: z.string().min(1),
  gameRef: z.custom<GameRef>((val) => val instanceof DocumentReference),
})

export const mapDocSchemaWithId = z.object({
  ...mapDocSchema.shape,
  ...WITH_ID.shape,
})

export type MapDoc = z.infer<typeof mapDocSchema>
export type MapDocWithId = z.infer<typeof mapDocSchemaWithId>
