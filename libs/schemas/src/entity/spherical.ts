import z from "zod"
import { gameDocWithIdSchema, sphericalDocWithIdSchema } from "~/firestore"

const gameSchema = z.object({
  ...gameDocWithIdSchema.omit({
    createdAt: true,
    updatedAt: true,
  }).shape,
})

export const sphericalEntitySchema = z.object({
  ...sphericalDocWithIdSchema.shape,
  game: gameSchema,
})

export type SphericalEntity = z.infer<typeof sphericalEntitySchema>
