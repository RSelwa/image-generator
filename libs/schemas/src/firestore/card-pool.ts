import { z } from "zod"

export const cardPoolEntrySchema = z.object({
  mapId: z.string().min(1),
  gameId: z.string().min(1),
})

export const cardPoolDocSchema = z.object({
  maps: z.array(cardPoolEntrySchema),
})

export type CardPoolEntry = z.infer<typeof cardPoolEntrySchema>
export type CardPoolDoc = z.infer<typeof cardPoolDocSchema>
