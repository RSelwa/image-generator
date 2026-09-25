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

export const seedGameCard = async (
  gameId: string,
  cardProperties: CardProperties,
) => {
  const card = await refs[TABLES.CARDS].add({
    type: CARD_TYPE.GAME,
    gameId,
    cardProperties,
    createdAt: null,
    updatedAt: null,
  })

  return card.id
}

const seedEveryPoolWith = (cardId: string, gameId: string) =>
  Promise.all(
    Object.values(CARD_RARITY).map((rarity) =>
      refs[TABLES.CARD_POOLS].doc(rarity).set({ cards: [{ cardId, gameId }] }),
    ),
  )

export const seedEveryPoolWithOneCard = async (
  cardProperties: CardProperties,
) => {
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)
  const mapCard = await seedMapCard(game.id, cardProperties)
  await seedEveryPoolWith(mapCard.cardId, game.id)

  return mapCard
}

export const seedEveryPoolWithOneGameCard = async (
  cardProperties: CardProperties,
) => {
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)
  const cardId = await seedGameCard(game.id, cardProperties)
  await seedEveryPoolWith(cardId, game.id)

  return { game, cardId }
}

export const enableTcgFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.TCG)
