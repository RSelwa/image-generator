import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { cardPoolDocSchema } from "@repo/schemas"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { formatCardNumber } from "@/utils/card-number"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag } from "../helpers/tcg"

const LOCKED_CARD_NUMBER = 42
const OWNED_CARD_NUMBER = 43
const OWNED_CARD_PROPERTIES = {
  rarity: CARD_RARITY.LEGENDARY,
  number: OWNED_CARD_NUMBER,
}
const OWNED_COUNT = 2

const seedGameWithTwoCards = async () => {
  const game = gameFactory()
  const ownedMap = mapFactory({
    gameId: game.id,
    cardProperties: OWNED_CARD_PROPERTIES,
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

const openCollectionOwning = async (
  page: Page,
  mapId: string,
  gameId: string,
) => {
  const user = await setupUser()
  await subRefs[TABLES.CARDS](user.id).doc(mapId).set({
    mapId,
    gameId,
    count: OWNED_COUNT,
    cardPropertiesAtPull: OWNED_CARD_PROPERTIES,
    firstPulledAt: Timestamp.now(),
    lastPulledAt: Timestamp.now(),
  })
  await enableTcgFlag(page)
  await loginViaUI(page, user.email)
  await page.goto(`/en${PAGES.COLLECTION}`)
}

test.describe.configure({ mode: "serial" })

test.describe("when a user opens their collection", () => {
  test("should show the owned and locked cards with their number", async ({
    page,
  }) => {
    const { gameId, ownedMap, lockedMap } = await seedGameWithTwoCards()

    await openCollectionOwning(page, ownedMap.id, gameId)

    await expect(
      page.getByTestId(SELECTORS.COLLECTION_GAME_PROGRESS(gameId)),
    ).toHaveText("1/2")
    await expect(
      page.getByTestId(SELECTORS.TRADING_CARD(ownedMap.id)),
    ).toContainText(formatCardNumber(OWNED_CARD_NUMBER))
    await expect(
      page.getByTestId(SELECTORS.COLLECTION_LOCKED_CARD(lockedMap.id)),
    ).toContainText(formatCardNumber(LOCKED_CARD_NUMBER))
  })

  test("should order the cards by number rather than rarity", async ({
    page,
  }) => {
    const { gameId, ownedMap, lockedMap } = await seedGameWithTwoCards()

    await openCollectionOwning(page, ownedMap.id, gameId)

    await expect
      .poll(() =>
        page
          .getByTestId(SELECTORS.COLLECTION_GAME(gameId))
          .locator("li > [data-testid]")
          .evaluateAll((cards) =>
            cards.map((card) => card.getAttribute("data-testid")),
          ),
      )
      .toEqual([
        SELECTORS.COLLECTION_LOCKED_CARD(lockedMap.id),
        SELECTORS.TRADING_CARD(ownedMap.id),
      ])
  })

  test("should show the overall collection progress", async ({ page }) => {
    const { gameId, ownedMap } = await seedGameWithTwoCards()
    const pools = await refs[TABLES.CARD_POOLS].get()
    const entries = pools.docs.flatMap(
      (pool) => cardPoolDocSchema.safeParse(pool.data()).data?.maps || [],
    )
    const maps = await db.getAll(
      ...entries.map((entry) =>
        subRefs[TABLES.MAPS](entry.gameId).doc(entry.mapId),
      ),
    )

    const total = maps.filter((map) => map.data()?.cardProperties).length

    await openCollectionOwning(page, ownedMap.id, gameId)

    await expect(page.getByTestId(SELECTORS.COLLECTION_PROGRESS)).toContainText(
      `1/${total}`,
    )
  })
})
