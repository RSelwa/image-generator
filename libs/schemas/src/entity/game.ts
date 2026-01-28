import z from "zod"
import { gameDocWithIdSchema } from "~/firestore"

export const gameEntitySchema = z.object({
  ...gameDocWithIdSchema.shape,
  sphericalsCount: z.number(),
})

export type GameEntity = z.infer<typeof gameEntitySchema>
