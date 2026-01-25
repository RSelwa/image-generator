import z from "zod"

export const sphericalDocSchema = z.object({
  gameRef: z.string(),
  image: z.string(),
  mosaics: z.array(z.string()).nullish(),
})

export type SphericalDoc = z.infer<typeof sphericalDocSchema>
