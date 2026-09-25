import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, PACK_SIZE } from "@repo/common"
import { Timestamp } from "firebase-admin/firestore"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag, seedEveryPoolWithOneCard } from "../helpers/tcg"

const CARD_NUMBER = 42

const PACKS_LEFT = 7
const LAST_PACK = 1

const openPackPage = async (page: Page, packsStored: number) => {
  const user = await setupUser({
    packsStored,
    packsRefillAnchor: Timestamp.now() as unknown as ClientTimestamp,
  })
  await enableTcgFlag(page)
  await loginViaUI(page, user.email)
  await page.goto(`/en${PAGES.PACKS}`)
}

const revealEveryCard = async (page: Page) => {
  for (let index = 0; index < PACK_SIZE; index += 1) {
    await page.getByTestId(SELECTORS.PACK_REVEAL_CARD(index)).click()
  }
}

test.describe.configure({ mode: "serial" })

test.describe("when a pack is opened from the packs page", () => {
  test.beforeEach(async () => {
    await seedEveryPoolWithOneCard({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })
  })

  test("should reveal the next card on a click on the top card", async ({
    page,
  }) => {
    await openPackPage(page, PACKS_LEFT)
    await page.getByTestId(SELECTORS.PACK_OPEN).click()
    await page.getByTestId(SELECTORS.PACK_REVEAL_CARD(0)).click()

    await expect(page.getByTestId(SELECTORS.PACK_REVEAL_PROGRESS)).toHaveText(
      `2/${PACK_SIZE}`,
    )
  })

  test("should reveal the next card with the keyboard", async ({ page }) => {
    await openPackPage(page, PACKS_LEFT)
    await page.getByTestId(SELECTORS.PACK_OPEN).click()
    await page.getByTestId(SELECTORS.PACK_REVEAL_CARD(0)).press("Enter")

    await expect(page.getByTestId(SELECTORS.PACK_REVEAL_PROGRESS)).toHaveText(
      `2/${PACK_SIZE}`,
    )
  })

  test("should show the summary with the new card once every card is revealed", async ({
    page,
  }) => {
    await openPackPage(page, PACKS_LEFT)
    await page.getByTestId(SELECTORS.PACK_OPEN).click()
    await revealEveryCard(page)

    await expect(page.getByTestId(SELECTORS.PACK_REVEAL_NEW)).toHaveCount(1)
    await expect(page.getByTestId(SELECTORS.PACK_OPEN_ANOTHER)).toBeVisible()
  })

  test("should not offer another pack after the last one", async ({ page }) => {
    await openPackPage(page, LAST_PACK)
    await page.getByTestId(SELECTORS.PACK_OPEN).click()
    await revealEveryCard(page)

    await expect(page.getByTestId(SELECTORS.PACK_REVEAL_SUMMARY)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.PACK_OPEN_ANOTHER)).toHaveCount(0)
  })
})
