import { DocumentReference } from "firebase-admin/firestore"
import z from "zod"
import type { GameRef } from "~/firestore/game"

export const sphericalDocSchema = z.object({
 gameRef: z.custom<GameRef>((val) => val instanceof DocumentReference),
  image: z.string(),
})

export type SphericalDoc = z.infer<typeof sphericalDocSchema>
