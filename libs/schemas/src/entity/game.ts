import z from "zod"
import { gameDocWithIdSchema } from "~/firestore"

export const gameEntitySchema = z.object({
  ...gameDocWithIdSchema.omit({
    createdAt: true,
    updatedAt: true,
  }).shape,
  sphericalsCount: z.number(),
})

export type GameEntity = z.infer<typeof gameEntitySchema>
