import { type Page } from "@playwright/test"
import { CARD_RARITY, CARD_TYPE, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardProperties } from "@repo/schemas"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { FEATURE_FLAGS } from "@/constants/feature-flags"

export const seedMapCard = async (
  gameId: string,
  cardProperties: CardProperties,
) => {
  const map = mapFactory({ gameId })
  await subRefs[TABLES.MAPS](gameId).doc(map.id).set(map)
  const card = await refs[TABLES.CARDS].add({
    type: CARD_TYPE.MAP,
    gameId,
    mapId: map.id,
    cardProperties,
    createdAt: null,
    updatedAt: null,
  })

  return { map, cardId: card.id }
}

export const seedEveryPoolWithOneCard = async (
  cardProperties: CardProperties,
) => {
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)
  const mapCard = await seedMapCard(game.id, cardProperties)
  await Promise.all(
    Object.values(CARD_RARITY).map((rarity) =>
      refs[TABLES.CARD_POOLS]
        .doc(rarity)
        .set({ cards: [{ cardId: mapCard.cardId, gameId: game.id }] }),
    ),
  )

  return mapCard
}

export const enableTcgFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.TCG)
