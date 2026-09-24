import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"

const OWNED_COUNT = 2

const enableTcgFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.TCG)

const seedGameWithTwoCards = async () => {
  const game = gameFactory()
  const ownedMap = mapFactory({
    gameId: game.id,
    cardProperties: { rarity: CARD_RARITY.LEGENDARY },
  })
  const lockedMap = mapFactory({
    gameId: game.id,
    cardProperties: { rarity: CARD_RARITY.COMMON },
  })
  await refs[TABLES.GAMES].doc(game.id).set(game)
  await Promise.all(
    [ownedMap, lockedMap].map((map) =>
      subRefs[TABLES.MAPS](game.id).doc(map.id).set(map),
    ),
  )
  await refs[TABLES.CARD_POOLS]
    .doc(CARD_RARITY.LEGENDARY)
    .set({ maps: [{ mapId: ownedMap.id, gameId: game.id }] })
  await refs[TABLES.CARD_POOLS]
    .doc(CARD_RARITY.COMMON)
    .set({ maps: [{ mapId: lockedMap.id, gameId: game.id }] })

  return { gameId: game.id, ownedMap, lockedMap }
}

test.describe.configure({ mode: "serial" })

test.describe("when a user opens their collection", () => {
  test("should show the owned and locked cards of each game", async ({
    page,
  }) => {
    const { gameId, ownedMap, lockedMap } = await seedGameWithTwoCards()
    const user = await setupUser()
    await subRefs[TABLES.CARDS](user.id)
      .doc(ownedMap.id)
      .set({
        mapId: ownedMap.id,
        gameId,
        count: OWNED_COUNT,
        cardPropertiesAtPull: { rarity: CARD_RARITY.LEGENDARY },
        firstPulledAt: Timestamp.now(),
        lastPulledAt: Timestamp.now(),
      })

    await enableTcgFlag(page)
    await loginViaUI(page, user.email)
    await page.goto(`/en${PAGES.COLLECTION}`)

    await expect(
      page.getByTestId(SELECTORS.COLLECTION_GAME_PROGRESS(gameId)),
    ).toHaveText("1/2")
    await expect(
      page.getByTestId(SELECTORS.TRADING_CARD(ownedMap.id)),
    ).toBeVisible()
    await expect(
      page.getByTestId(SELECTORS.COLLECTION_LOCKED_CARD(lockedMap.id)),
    ).toBeVisible()
  })
})
