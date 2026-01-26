import z from "zod"
import { gameDocWithIdSchema } from "~/firestore"
import { sphericalDocWithIdSchema } from "~/firestore/spherical"

export const sphericalEntitySchema = z.object({
  ...sphericalDocWithIdSchema.shape,
  game: z.object({
    ...gameDocWithIdSchema.shape,
  }),
})

export type SphericalEntity = z.infer<typeof sphericalEntitySchema>
