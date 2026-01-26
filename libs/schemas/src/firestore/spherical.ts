import z from "zod"
import { WITH_ID } from "~/zod"

export const sphericalDocSchema = z.object({
  gameRef: z.string(),
  image: z.string(),
  mosaics: z.array(z.string()).nullish(),
})

export const sphericalDocWithIdSchema = z.object({
  ...sphericalDocSchema.shape,
  ...WITH_ID.shape,
})

export type SphericalDoc = z.infer<typeof sphericalDocSchema>
export type SphericalDocWithId = z.infer<typeof sphericalDocWithIdSchema>
