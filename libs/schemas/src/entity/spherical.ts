import z from "zod"
import { type GameDocWithId, gameDocWithIdSchema, type SphericalDocWithId, sphericalDocWithIdSchema } from "~/firestore"
import { mapPositionSchema } from "~/firestore/spherical"

const gameSchema = z.object({
  ...gameDocWithIdSchema.omit({
    createdAt: true,
    updatedAt: true,
  }).shape,
})

const sphericalBaseEntitySchema = z.object({
  ...sphericalDocWithIdSchema.omit({ mapId: true, mapPosition: true }).shape,
  game: gameSchema,
})

const sphericalWithMapEntitySchema = sphericalBaseEntitySchema.extend({
  hasMap: z.literal(true),
  mapId: z.string(),
  mapPosition: mapPositionSchema,
})

const sphericalWithoutMapEntitySchema = sphericalBaseEntitySchema.extend({
  hasMap: z.literal(false),
})

export const sphericalEntitySchema = z.discriminatedUnion("hasMap", [
  sphericalWithMapEntitySchema,
  sphericalWithoutMapEntitySchema,
])

export type SphericalWithMapEntity = z.infer<typeof sphericalWithMapEntitySchema>
export type SphericalWithoutMapEntity = z.infer<typeof sphericalWithoutMapEntitySchema>
export type SphericalEntity = z.infer<typeof sphericalEntitySchema>

export const toSphericalEntity = (doc: SphericalDocWithId, game: GameDocWithId): SphericalEntity | null => {
  const raw = { ...doc, game, hasMap: !!doc.mapId }
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
  const { data, error } = sphericalEntitySchema.safeParse(cleaned)

  if (error) {
    console.error(`Spherical ${doc.id} is incomplete:`, error)

    return null
  }

  return data
}
