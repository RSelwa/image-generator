import z from "zod"

export const sphericalEntitySchema = z.object({})

export type SphericalEntity = z.infer<typeof sphericalEntitySchema>
