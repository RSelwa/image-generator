import { CARD_RARITY } from "@repo/common"
import { z } from "zod"
import { type CardProperties } from "~/firestore/card-properties"

export const cardPoolEntrySchema = z.object({
  mapId: z.string().min(1),
  gameId: z.string().min(1),
})

export const cardPoolDocSchema = z.object({
  maps: z.array(cardPoolEntrySchema),
})

export type CardPoolEntry = z.infer<typeof cardPoolEntrySchema>
export type CardPoolDoc = z.infer<typeof cardPoolDocSchema>

export const buildCardPools = (
  maps: (CardPoolEntry & { cardProperties?: CardProperties })[],
) =>
  Object.values(CARD_RARITY).map((rarity) => ({
    rarity,
    pool: {
      maps: maps
        .filter(({ cardProperties }) => cardProperties?.rarity === rarity)
        .map(({ mapId, gameId }) => ({ mapId, gameId })),
    } satisfies CardPoolDoc,
  }))
