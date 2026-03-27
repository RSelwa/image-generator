import z from "zod"

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

export const readyImageItemSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  image: z.string(),
})

export const readyImagesDocSchema = z.object({
  sphericals: z.array(readyImageItemSchema).default([]),
  flats: z.array(readyImageItemSchema).default([]),
})

export type ReadyImageItem = z.infer<typeof readyImageItemSchema>
export type ReadyImagesDoc = z.infer<typeof readyImagesDocSchema>
