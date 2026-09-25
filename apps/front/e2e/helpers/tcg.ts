import { type Page } from "@playwright/test"
import { CARD_TYPE, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardFields } from "@repo/schemas"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { FEATURE_FLAGS } from "@/constants/feature-flags"

export const seedMapCard = async (gameId: string, cardFields: CardFields) => {
  const map = mapFactory({ gameId })
  await subRefs[TABLES.MAPS](gameId).doc(map.id).set(map)
  const card = await refs[TABLES.CARDS].add({
    type: CARD_TYPE.MAP,
    gameId,
    mapId: map.id,
    ...cardFields,
    createdAt: null,
    updatedAt: null,
  })

  return { map, cardId: card.id }
}

export const seedGameCard = async (gameId: string, cardFields: CardFields) => {
  const card = await refs[TABLES.CARDS].add({
    type: CARD_TYPE.GAME,
    gameId,
    ...cardFields,
    createdAt: null,
    updatedAt: null,
  })

  return card.id
}

const clearCards = async () => {
  const cards = await refs[TABLES.CARDS].get()
  await Promise.all(cards.docs.map((card) => card.ref.delete()))
}

export const seedOnlyMapCard = async (cardFields: CardFields) => {
  await clearCards()
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)

  return seedMapCard(game.id, cardFields)
}

export const seedOnlyGameCard = async (cardFields: CardFields) => {
  await clearCards()
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)
  const cardId = await seedGameCard(game.id, cardFields)

  return { game, cardId }
}

export const enableTcgFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.TCG)
