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
