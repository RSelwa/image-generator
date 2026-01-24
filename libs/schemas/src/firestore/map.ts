import { DocumentReference } from "firebase-admin/firestore"
import z from "zod"
import type { GameDoc } from "~/firestore/game"

type GameRef = DocumentReference<GameDoc, GameDoc>

export const mapDocSchema = z.object({
  title: z.string().min(1),
  gameRef: z.custom<GameRef>((val) => val instanceof DocumentReference),
})

export type MapDoc = z.infer<typeof mapDocSchema>
