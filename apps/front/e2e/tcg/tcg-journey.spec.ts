import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, PACK_SIZE, PACKS_MAX, TABLES } from "@repo/common"
import { subRefs } from "@repo/providers/db-refs"
import { Timestamp } from "firebase-admin/firestore"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag, seedEveryPoolWithOneCard } from "../helpers/tcg"

const CARD_NUMBER = 42

const PACKS_LEFT = 7
const NO_PACK = 0

const loginWithPacks = async (page: Page, packsStored: number) => {
  const user = await setupUser({
    packsStored,
    packsRefillAnchor: Timestamp.now() as unknown as ClientTimestamp,
  })
  await enableTcgFlag(page)
  await loginViaUI(page, user.email)
}

const openAndRevealPack = async (page: Page) => {
  await page.getByTestId(SELECTORS.PACK_OPEN).click()
  for (let index = 0; index < PACK_SIZE; index += 1) {
    await page.getByTestId(SELECTORS.PACK_REVEAL_CARD(index)).click()
  }
}

test.describe.configure({ mode: "serial" })

test.describe("when a user plays the TCG from the packs page", () => {
  test("should show the pack stock and the refill timer", async ({ page }) => {
    await loginWithPacks(page, PACKS_LEFT)
    await page.goto(`/en${PAGES.PACKS}`)

    await expect(page.getByTestId(SELECTORS.PACK_STOCK)).toHaveText(
      `${PACKS_LEFT}/${PACKS_MAX}`,
    )
    await expect(page.getByTestId(SELECTORS.PACK_TIMER)).toBeVisible()
  })

  test("should count the opened pack off the stock", async ({ page }) => {
    await seedEveryPoolWithOneCard({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })
    await loginWithPacks(page, PACKS_LEFT)
    await page.goto(`/en${PAGES.PACKS}`)
    await openAndRevealPack(page)
    await page.getByTestId(SELECTORS.PACK_BACK).click()

    await expect(page.getByTestId(SELECTORS.PACK_STOCK)).toHaveText(
      `${PACKS_LEFT - 1}/${PACKS_MAX}`,
    )
  })

  test("should add the opened cards to the collection", async ({ page }) => {
    const { cardId } = await seedEveryPoolWithOneCard({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })
    await loginWithPacks(page, PACKS_LEFT)
    await page.goto(`/en${PAGES.PACKS}`)
    await openAndRevealPack(page)
    await page.getByTestId(SELECTORS.PACK_SEE_COLLECTION).click()

    await expect(page.getByTestId(SELECTORS.TRADING_CARD(cardId))).toBeVisible()
  })

  test("should not open a pack without any left", async ({ page }) => {
    await seedEveryPoolWithOneCard({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })
    await loginWithPacks(page, NO_PACK)
    await page.goto(`/en${PAGES.PACKS}`)

    await expect(page.getByTestId(SELECTORS.PACK_STOCK)).toHaveText(
      `${NO_PACK}/${PACKS_MAX}`,
    )
    await expect(page.getByTestId(SELECTORS.PACK_OPEN)).toBeDisabled()
  })

  test("should keep another user's cards out of the collection", async ({
    page,
  }) => {
    const { map, cardId } = await seedEveryPoolWithOneCard({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })
    const collector = await setupUser()
    await subRefs[TABLES.CARDS](collector.id)
      .doc(cardId)
      .set({
        cardId,
        gameId: map.gameId,
        count: 1,
        cardPropertiesAtPull: { rarity: CARD_RARITY.RARE, number: CARD_NUMBER },
        firstPulledAt: Timestamp.now(),
        lastPulledAt: Timestamp.now(),
      })

    await loginWithPacks(page, PACKS_LEFT)
    await page.goto(`/en${PAGES.COLLECTION}`)

    await expect(
      page.getByTestId(SELECTORS.COLLECTION_LOCKED_CARD(cardId)),
    ).toBeVisible()
    await expect(page.getByTestId(SELECTORS.TRADING_CARD(cardId))).toHaveCount(
      0,
    )
  })
})
