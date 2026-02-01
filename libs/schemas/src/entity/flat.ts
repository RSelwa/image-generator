import z from "zod"
import { flatDocWithIdSchema, gameDocWithIdSchema } from "~/firestore"

const gameSchema = z.object({
  ...gameDocWithIdSchema.omit({
    createdAt: true,
    updatedAt: true,
  }).shape,
})

export const flatEntitySchema = z.object({
  ...flatDocWithIdSchema.shape,
  game: gameSchema,
})

export type FlatEntity = z.infer<typeof flatEntitySchema>
