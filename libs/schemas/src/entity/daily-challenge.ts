import { DIFFICULTIES } from "@repo/common"
import z from "zod"
import { dailyChallengeDateSchema, type DailyChallengeDocWithId } from "~/firestore/daily-challenge"
import { mapPositionSchema } from "~/firestore/spherical"

const dailyChallengeBaseSchema = z.object({
  id: z.string(),
  date: dailyChallengeDateSchema,
  gameId: z.string(),
  gameTitle: z.string(),
  gameAlternateNames: z.array(z.string()),
  gameThumbnailUrl: z.string(),
  difficulty: z.enum(DIFFICULTIES),
})

const withMapSchema = z.object({
  hasMap: z.literal(true),
  mapId: z.string(),
  mapImage: z.string(),
  mapPosition: mapPositionSchema,
  mapWidth: z.number().positive(),
  mapHeight: z.number().positive(),
  maxDistancePoints: z.number().min(0).max(100),
})

const withoutMapSchema = z.object({
  hasMap: z.literal(false),
})

const sphericalBaseSchema = z.object({ isSpherical: z.literal(true), sphericalId: z.string(), sphericalImageUrl: z.string() })
const flatBaseSchema = z.object({ isSpherical: z.literal(false), flatId: z.string(), flatImageUrl: z.string() })

const sphericalWithMapSchema = dailyChallengeBaseSchema.extend(sphericalBaseSchema.shape).extend(withMapSchema.shape)
const sphericalWithoutMapSchema = dailyChallengeBaseSchema.extend(sphericalBaseSchema.shape).extend(withoutMapSchema.shape)
const flatWithMapSchema = dailyChallengeBaseSchema.extend(flatBaseSchema.shape).extend(withMapSchema.shape)
const flatWithoutMapSchema = dailyChallengeBaseSchema.extend(flatBaseSchema.shape).extend(withoutMapSchema.shape)

const sphericalSchema = z.discriminatedUnion("hasMap", [sphericalWithMapSchema, sphericalWithoutMapSchema])
const flatSchema = z.discriminatedUnion("hasMap", [flatWithMapSchema, flatWithoutMapSchema])

export const dailyChallengeEntitySchema = z.union([sphericalSchema, flatSchema])

export type DailyChallengeEntity = z.infer<typeof dailyChallengeEntitySchema>

export const toDailyChallengeEntity = (doc: DailyChallengeDocWithId): DailyChallengeEntity | null => {
  const raw = { ...doc, hasMap: !!doc.mapId }
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
  const { data, error } = dailyChallengeEntitySchema.safeParse(cleaned)

  if (error) {
    console.error(`Daily challenge ${doc.id} is incomplete:`, error)

    return null
  }

  return data
}
