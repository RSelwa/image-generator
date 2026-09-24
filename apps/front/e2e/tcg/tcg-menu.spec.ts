import { expect, type Page, test } from "@playwright/test"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag } from "../helpers/tcg"

const openUserMenu = async (page: Page) => {
  const user = await setupUser()
  await loginViaUI(page, user.email)
  await page.getByTestId(SELECTORS.NAV_USER_DROPDOWN_TRIGGER).click()
}

test.describe("when the TCG flag is disabled", () => {
  test("should hide the TCG menu tabs", async ({ page }) => {
    await openUserMenu(page)

    await expect(page.getByTestId(SELECTORS.NAV_HISTORY_LINK)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.NAV_PACKS)).toHaveCount(0)
    await expect(page.getByTestId(SELECTORS.NAV_COLLECTION)).toHaveCount(0)
  })

  test("should redirect the packs page home", async ({ page }) => {
    await page.goto(`/en${PAGES.PACKS}`)

    await expect(page).toHaveURL("/en")
  })
})

test.describe("when the TCG flag is enabled", () => {
  test("should link the packs page", async ({ page }) => {
    await enableTcgFlag(page)
    await openUserMenu(page)

    await expect(page.getByTestId(SELECTORS.NAV_PACKS)).toHaveAttribute(
      "href",
      `/en${PAGES.PACKS}`,
    )
  })

  test("should link the collection page", async ({ page }) => {
    await enableTcgFlag(page)
    await openUserMenu(page)

    await expect(page.getByTestId(SELECTORS.NAV_COLLECTION)).toHaveAttribute(
      "href",
      `/en${PAGES.COLLECTION}`,
    )
  })
})
