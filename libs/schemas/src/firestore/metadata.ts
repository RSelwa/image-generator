import { DEFAULT_MAX_DISTANCE_POINTS, DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import z from "zod"
import { type GameDoc } from "~/firestore/game"
import { type MapDoc } from "~/firestore/map"
import { type SpecialRoundOption, specialRoundOptionSchema } from "~/firestore/seed.option"
import { type Round, roundSchema } from "~/firestore/seed.round"
import { type MapPosition, mapPositionSchema } from "~/firestore/spherical"

export const gamesListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

export const gamesListDocSchema = z.object({
  games: z.array(gamesListItemSchema),
})

export type GamesListItem = z.infer<typeof gamesListItemSchema>
export type GamesListDoc = z.infer<typeof gamesListDocSchema>

export const dailyChallengeHistoryDocSchema = z.object({
  usedImages: z.record(z.string(), z.string()),
})

export type DailyChallengeHistoryDoc = z.infer<typeof dailyChallengeHistoryDocSchema>

// A ready image, pre-joined with its game + map data so seed generation needs
// no per-image reads. One entry can be eligible for normal rounds (has map data)
// and/or special rounds (has a thumbnail).
export const readyImageItemSchema = z.object({
  type: z.enum(ROUND_TYPE),
  id: z.string(),
  gameId: z.string(),
  image: z.string(),
  difficulty: z.enum(DIFFICULTIES).default(DIFFICULTIES.EASY),

  // Denormalized game data
  gameTitle: z.string().nullish().default(null),
  gameAlternateNames: z.array(z.string()).nullish().default(null),
  gameThumbnailUrl: z.string().nullish().default(null),

  // Denormalized map data (present => eligible for normal rounds)
  mapId: z.string().nullish().default(null),
  mapPosition: mapPositionSchema.nullish().default(null),
  mapImage: z.string().nullish().default(null),
  mapWidth: z.number().positive().nullish().default(null),
  mapHeight: z.number().positive().nullish().default(null),
  maxDistancePoints: z.number().min(0).max(100).nullish().default(null),

  // Present => eligible for special rounds
  thumbnail: z.string().nullish().default(null),
})

export const readyImagesDocSchema = z.object({
  sphericals: z.array(readyImageItemSchema).default([]),
  flats: z.array(readyImageItemSchema).default([]),
})

export type ReadyImageItem = z.infer<typeof readyImageItemSchema>
export type ReadyImagesDoc = z.infer<typeof readyImagesDocSchema>

// Build a pool entry from a ready image and its already-fetched game/map docs.
// Pure: the I/O (fetching game/map) is the caller's responsibility.
export const buildReadyImageItem = ({
  type,
  id,
  gameId,
  image,
  thumbnail,
  mapId,
  mapPosition,
  difficulty,
  game,
  map,
}: {
  type: (typeof ROUND_TYPE)[keyof typeof ROUND_TYPE]
  id: string
  gameId: string
  image: string
  thumbnail?: string | null
  mapId?: string | null
  mapPosition?: MapPosition | null
  difficulty?: (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES] | null
  game: Pick<GameDoc, "title" | "alternateNames" | "image"> | undefined
  map: Pick<MapDoc, "imageUrl" | "width" | "height" | "maxDistancePoints"> | undefined | null
}): ReadyImageItem | null => {
  const parsed = readyImageItemSchema.safeParse({
    type,
    id,
    gameId,
    image,
    difficulty: difficulty || DIFFICULTIES.EASY,
    gameTitle: game?.title || null,
    gameAlternateNames: game?.alternateNames || null,
    gameThumbnailUrl: game?.image || null,
    mapId: mapId || null,
    mapPosition: mapPosition || null,
    mapImage: map?.imageUrl || null,
    mapWidth: map?.width || null,
    mapHeight: map?.height || null,
    maxDistancePoints: map?.maxDistancePoints || null,
    thumbnail: thumbnail || null,
  })

  if (!parsed.success) return null

  return parsed.data
}

// Map a pool entry to a normal round. Returns null when the entry lacks map data.
export const readyImageItemToRound = (item: ReadyImageItem): Round | null => {
  if (!item.mapId || !item.mapImage || !item.gameTitle) return null

  const parsed = roundSchema.safeParse({
    isSpecial: false,
    type: item.type,
    gameId: item.gameId,
    gameTitle: item.gameTitle,
    gameAlternateNames: item.gameAlternateNames,
    gameThumbnailUrl: item.gameThumbnailUrl,
    sphericalId: item.type === ROUND_TYPE.SPHERICAL ? item.id : null,
    sphericalImageUrl: item.type === ROUND_TYPE.SPHERICAL ? item.image : null,
    flatId: item.type === ROUND_TYPE.FLAT ? item.id : null,
    flatImageUrl: item.type === ROUND_TYPE.FLAT ? item.image : null,
    mapId: item.mapId,
    mapPosition: item.mapPosition,
    mapImage: item.mapImage,
    mapWidth: item.mapWidth,
    mapHeight: item.mapHeight,
    maxDistancePoints: item.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
    difficulty: item.difficulty,
  })

  if (!parsed.success) return null

  return parsed.data
}

// Map a pool entry to a special-round option. Returns null without a thumbnail.
export const readyImageItemToSpecialOption = (item: ReadyImageItem): SpecialRoundOption | null => {
  if (!item.thumbnail || !item.gameTitle) return null

  const parsed = specialRoundOptionSchema.safeParse({
    type: item.type,
    gameId: item.gameId,
    gameTitle: item.gameTitle,
    gameAlternateNames: item.gameAlternateNames,
    gameThumbnailUrl: item.gameThumbnailUrl,
    thumbnailUrl: item.thumbnail,
    sphericalId: item.type === ROUND_TYPE.SPHERICAL ? item.id : null,
    sphericalImage: item.type === ROUND_TYPE.SPHERICAL ? item.image : null,
    flatId: item.type === ROUND_TYPE.FLAT ? item.id : null,
    flatImage: item.type === ROUND_TYPE.FLAT ? item.image : null,
  })

  if (!parsed.success) return null

  return parsed.data
}
