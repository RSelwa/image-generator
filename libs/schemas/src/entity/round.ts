import { DIFFICULTIES, ROUND_TYPE, SPECIAL_ROUND_OPTIONS_COUNT } from "@repo/common"
import z from "zod"
import { specialRoundOptionSchema } from "~/firestore/seed.option"
import { mapPositionSchema } from "~/firestore/spherical"
import { type Round } from "~/firestore/seed.round"

// ─── Base fields shared by all normal (non-special) rounds ───────────────────

const normalRoundBaseSchema = z.object({
  isSpecial: z.literal(false),
  gameId: z.string(),
  gameTitle: z.string(),
  gameAlternateNames: z.array(z.string()).nullish().default(null),
  gameThumbnailUrl: z.string().nullish().default(null),
  difficulty: z.enum(DIFFICULTIES),
})

// ─── Map fields: required when mode === 'full' ────────────────────────────────

const roundWithMapSchema = z.object({
  mode: z.literal("full"),
  mapId: z.string(),
  mapPosition: mapPositionSchema,
  mapImage: z.string(),
  mapWidth: z.number().positive(),
  mapHeight: z.number().positive(),
  maxDistancePoints: z.number().min(0).max(100),
})

const roundGameOnlySchema = z.object({
  mode: z.literal("game-only"),
})

// ─── Image-type discriminators ────────────────────────────────────────────────

const sphericalImageSchema = z.object({
  isSpherical: z.literal(true),
  sphericalId: z.string(),
  sphericalImageUrl: z.string(),
})

const flatImageSchema = z.object({
  isSpherical: z.literal(false),
  flatId: z.string(),
  flatImageUrl: z.string(),
})

// ─── 4 normal round variants ──────────────────────────────────────────────────

const sphericalFullRoundEntitySchema = normalRoundBaseSchema
  .extend(sphericalImageSchema.shape)
  .extend(roundWithMapSchema.shape)

const sphericalGameOnlyRoundEntitySchema = normalRoundBaseSchema
  .extend(sphericalImageSchema.shape)
  .extend(roundGameOnlySchema.shape)

const flatFullRoundEntitySchema = normalRoundBaseSchema
  .extend(flatImageSchema.shape)
  .extend(roundWithMapSchema.shape)

const flatGameOnlyRoundEntitySchema = normalRoundBaseSchema
  .extend(flatImageSchema.shape)
  .extend(roundGameOnlySchema.shape)

// ─── Special round ────────────────────────────────────────────────────────────

const specialRoundEntitySchema = z.object({
  isSpecial: z.literal(true),
  difficulty: z.enum(DIFFICULTIES),
  options: z.array(specialRoundOptionSchema).length(SPECIAL_ROUND_OPTIONS_COUNT),
})

// ─── Combined schema ──────────────────────────────────────────────────────────

const sphericalRoundEntitySchema = z.discriminatedUnion("mode", [
  sphericalFullRoundEntitySchema,
  sphericalGameOnlyRoundEntitySchema,
])

const flatRoundEntitySchema = z.discriminatedUnion("mode", [
  flatFullRoundEntitySchema,
  flatGameOnlyRoundEntitySchema,
])

const normalRoundEntitySchema = z.union([sphericalRoundEntitySchema, flatRoundEntitySchema])

export const roundEntitySchema = z.union([normalRoundEntitySchema, specialRoundEntitySchema])

// ─── Types ────────────────────────────────────────────────────────────────────

export type SphericalFullRoundEntity = z.infer<typeof sphericalFullRoundEntitySchema>
export type SphericalGameOnlyRoundEntity = z.infer<typeof sphericalGameOnlyRoundEntitySchema>
export type FlatFullRoundEntity = z.infer<typeof flatFullRoundEntitySchema>
export type FlatGameOnlyRoundEntity = z.infer<typeof flatGameOnlyRoundEntitySchema>
export type SpecialRoundEntity = z.infer<typeof specialRoundEntitySchema>
export type RoundEntity = z.infer<typeof roundEntitySchema>
export type NormalRoundEntity = SphericalFullRoundEntity | SphericalGameOnlyRoundEntity | FlatFullRoundEntity | FlatGameOnlyRoundEntity

// ─── Transformation ───────────────────────────────────────────────────────────

export const toRoundEntity = (round: Round): RoundEntity | null => {
  if (round.isSpecial) {
    const { data, error } = specialRoundEntitySchema.safeParse(round)

    if (error) {
      console.error("Special round parse error:", error)

      return null
    }

    return data
  }

  const mode = round.mapId ? "full" : "game-only"
  const isSpherical = round.type === ROUND_TYPE.SPHERICAL

  const raw = { ...round, mode, isSpherical }
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
  const { data, error } = roundEntitySchema.safeParse(cleaned)

  if (error) {
    console.error("Round parse error:", error)

    return null
  }

  return data
}
