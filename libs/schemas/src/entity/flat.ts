import z from "zod"
import { type FlatDocWithId, flatDocWithIdSchema, type GameDocWithId, gameDocWithIdSchema } from "~/firestore"
import { mapPositionSchema } from "~/firestore/spherical"

const gameSchema = z.object({
  ...gameDocWithIdSchema.omit({
    createdAt: true,
    updatedAt: true,
  }).shape,
})

const flatBaseEntitySchema = z.object({
  ...flatDocWithIdSchema.omit({ mapId: true, mapPosition: true }).shape,
  game: gameSchema,
})

const flatWithMapEntitySchema = flatBaseEntitySchema.extend({
  hasMap: z.literal(true),
  mapId: z.string(),
  mapPosition: mapPositionSchema,
})

const flatWithoutMapEntitySchema = flatBaseEntitySchema.extend({
  hasMap: z.literal(false),
})

export const flatEntitySchema = z.discriminatedUnion("hasMap", [
  flatWithMapEntitySchema,
  flatWithoutMapEntitySchema,
])

export type FlatWithMapEntity = z.infer<typeof flatWithMapEntitySchema>
export type FlatWithoutMapEntity = z.infer<typeof flatWithoutMapEntitySchema>
export type FlatEntity = z.infer<typeof flatEntitySchema>

export const toFlatEntity = (doc: FlatDocWithId, game: GameDocWithId): FlatEntity | null => {
  const raw = { ...doc, game, hasMap: !!doc.mapId }
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
  const { data, error } = flatEntitySchema.safeParse(cleaned)

  if (error) {
    console.error(`Flat ${doc.id} is incomplete:`, error)

    return null
  }

  return data
}
