import { CARD_RARITY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardProperties } from "@repo/schemas"
import { gameFactory, mapFactory } from "@repo/testing/factory"

export const seedEveryPoolWithOneMap = async (
  cardProperties: CardProperties,
) => {
  const game = gameFactory()
  const map = mapFactory({ gameId: game.id, cardProperties })
  await refs[TABLES.GAMES].doc(game.id).set(game)
  await subRefs[TABLES.MAPS](game.id).doc(map.id).set(map)
  await Promise.all(
    Object.values(CARD_RARITY).map((rarity) =>
      refs[TABLES.CARD_POOLS]
        .doc(rarity)
        .set({ maps: [{ mapId: map.id, gameId: game.id }] }),
    ),
  )

  return map
}
