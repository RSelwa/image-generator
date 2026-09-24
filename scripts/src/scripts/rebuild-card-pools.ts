import { TABLES } from "@repo/common"
import { collectionGroupRefs, refs } from "@repo/providers/db-refs"
import { buildCardPools } from "@repo/schemas"

const mapsSnapshot = await collectionGroupRefs[TABLES.MAPS].get()

const pools = buildCardPools(
  mapsSnapshot.docs.flatMap((map) => {
    const gameId = map.ref.parent.parent?.id

    if (!gameId) return []

    return [
      { mapId: map.id, gameId, cardProperties: map.data().cardProperties },
    ]
  }),
)

await Promise.all(
  pools.map(({ rarity, pool }) =>
    refs[TABLES.CARD_POOLS].doc(rarity).set(pool),
  ),
)

pools.forEach(({ rarity, pool }) => {
  console.info(`${rarity}: ${pool.maps.length} cards`)
})
