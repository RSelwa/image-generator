import { expect, type Page, test } from "@playwright/test"
import { LOBBY_STATUS } from "@repo/common"
import { lobbyFactory } from "@repo/testing/factory"
import { SELECTORS } from "@/constants/testing"
import { createFirestoreLobbyDoc, createPlayerFromUserDoc, hideDriverTutorial, loginViaUI, setupUser } from "@/e2e/helpers/lobby"

const openJoinModalFromNav = async (page: Page) => {
  await page.getByTestId("nav-user-dropdown-trigger").click()
  await page.getByTestId(SELECTORS.NAV_JOIN_LOBBY).click()
}

test.describe("join a lobby by code", () => {
  test.describe("when opening the modal from the nav dropdown", () => {
    test("should accept every typed character and join the lobby", async ({ page }) => {
      const host = await setupUser()
      const joiner = await setupUser()

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [createPlayerFromUserDoc(host)],
        status: LOBBY_STATUS.WAITING,
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, joiner.email)
      await hideDriverTutorial(page)

      await openJoinModalFromNav(page)

      const input = page.getByTestId(SELECTORS.JOIN_LOBBY_CODE_INPUT)

      await expect(input).toBeVisible()
      await input.pressSequentially(lobby.code, { delay: 100 })

      await expect(input).toHaveValue(lobby.code)
      await expect(page.getByTestId(SELECTORS.JOIN_LOBBY_FOUND)).toBeVisible()

      await page.getByTestId(SELECTORS.JOIN_LOBBY_SUBMIT).click()

      await page.waitForURL(`/en/lobby/${lobby.id}`, { timeout: 20000 })
    })
  })

  test.describe("when opening the modal from the home page", () => {
    test("should accept every typed character and join the lobby", async ({ page }) => {
      const host = await setupUser()
      const joiner = await setupUser()

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [createPlayerFromUserDoc(host)],
        status: LOBBY_STATUS.WAITING,
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, joiner.email)
      await hideDriverTutorial(page)

      await page.getByTestId(SELECTORS.HOME_JOIN_LOBBY).click()

      const input = page.getByTestId(SELECTORS.JOIN_LOBBY_CODE_INPUT)

      await expect(input).toBeVisible()
      await input.pressSequentially(lobby.code, { delay: 100 })

      await expect(input).toHaveValue(lobby.code)
      await expect(page.getByTestId(SELECTORS.JOIN_LOBBY_FOUND)).toBeVisible()

      await page.getByTestId(SELECTORS.JOIN_LOBBY_SUBMIT).click()

      await page.waitForURL(`/en/lobby/${lobby.id}`, { timeout: 20000 })
    })
  })

  test.describe("when the code is still incomplete", () => {
    test("should not announce that no lobby was found", async ({ page }) => {
      const host = await setupUser()
      const joiner = await setupUser()

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [createPlayerFromUserDoc(host)],
        status: LOBBY_STATUS.WAITING,
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, joiner.email)
      await hideDriverTutorial(page)

      await openJoinModalFromNav(page)

      const input = page.getByTestId(SELECTORS.JOIN_LOBBY_CODE_INPUT)

      await input.pressSequentially(lobby.code.slice(0, 4), { delay: 100 })

      await expect(page.getByTestId(SELECTORS.JOIN_LOBBY_NOT_FOUND)).toHaveCount(0)
    })
  })

  test.describe("when the code matches no lobby", () => {
    test("should announce that no lobby was found", async ({ page }) => {
      const joiner = await setupUser()

      await loginViaUI(page, joiner.email)
      await hideDriverTutorial(page)

      await openJoinModalFromNav(page)

      await page.getByTestId(SELECTORS.JOIN_LOBBY_CODE_INPUT).pressSequentially("ZZZZZZ", { delay: 100 })

      await expect(page.getByTestId(SELECTORS.JOIN_LOBBY_NOT_FOUND)).toBeVisible()
      await expect(page.getByTestId(SELECTORS.JOIN_LOBBY_SUBMIT)).toBeDisabled()
    })
  })
})
