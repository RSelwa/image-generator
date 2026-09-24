import { expect, test } from "@playwright/test"
import { CARD_RARITY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { formatCardNumber } from "@/utils/card-number"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag } from "../helpers/tcg"

const CARD_NUMBER = 42
const LOCKED_CARD_NUMBER = 43

const OWNED_COUNT = 2

const seedGameWithTwoCards = async () => {
  const game = gameFactory()
  const ownedMap = mapFactory({
    gameId: game.id,
    cardProperties: { rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER },
  })
  const lockedMap = mapFactory({
    gameId: game.id,
    cardProperties: { rarity: CARD_RARITY.COMMON, number: LOCKED_CARD_NUMBER },
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
        cardPropertiesAtPull: {
          rarity: CARD_RARITY.LEGENDARY,
          number: CARD_NUMBER,
        },
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
    ).toContainText(formatCardNumber(CARD_NUMBER))
    await expect(
      page.getByTestId(SELECTORS.COLLECTION_LOCKED_CARD(lockedMap.id)),
    ).toContainText(formatCardNumber(LOCKED_CARD_NUMBER))
  })
})
