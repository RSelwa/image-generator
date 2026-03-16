import { expect, test } from "@playwright/test"
import { lobbyFactory } from "@repo/testing/factory"
import {
  createFirestoreLobbyDoc,
  createLobbyViaUI,
  createPlayerFromUserDoc,
  loginViaUI,
  setupUser,
} from "../helpers/lobby"
import { STORAGE_KEYS } from "@/constants/mapping"

const DRIVER_POPOVER = ".driver-popover"
const DRIVER_NEXT_BTN = ".driver-popover-next-btn"
const DRIVER_CLOSE_BTN = ".driver-popover-close-btn"
const DRIVER_TITLE = ".driver-popover-title"

test.describe("Driver.js tutorial", () => {
  test.describe("when lobby owner", () => {
    test("should show the driver starting with the players step", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await expect(page.locator(DRIVER_POPOVER)).toBeVisible()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Players in lobby")
    })

    test("should include all owner steps in order", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await expect(page.locator(DRIVER_TITLE)).toHaveText("Players in lobby")
      await page.locator(DRIVER_NEXT_BTN).click()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Lobby configuration")
      await page.locator(DRIVER_NEXT_BTN).click()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Seed")
      await page.locator(DRIVER_NEXT_BTN).click()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Join lobby link")
      await page.locator(DRIVER_NEXT_BTN).click()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Start game")
    })
  })

  test.describe("when not lobby owner", () => {
    test("should show only players and ready up steps", async ({ page }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player],
      })
      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, player2.email)
      await page.goto(`/en/lobby/${lobby.id}`)

      await expect(page.locator(DRIVER_POPOVER)).toBeVisible()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Players in lobby")

      await page.locator(DRIVER_NEXT_BTN).click()
      await expect(page.locator(DRIVER_TITLE)).toHaveText("Ready up")
    })

    test("should not include owner steps", async ({ page }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player],
      })
      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, player2.email)
      await page.goto(`/en/lobby/${lobby.id}`)

      await expect(page.locator(DRIVER_POPOVER)).toBeVisible()
      await page.locator(DRIVER_NEXT_BTN).click()

      // The second step should be "Ready up", not "Lobby configuration"
      await expect(page.locator(DRIVER_TITLE)).not.toHaveText("Lobby configuration")
    })
  })

  test.describe("when already having the value in local storage", () => {
    test("should not show the driver", async ({ page }) => {
      const user = await setupUser()

      await page.addInitScript((key) => {
        localStorage.setItem(key, JSON.stringify(true))
      }, STORAGE_KEYS.DRIVER_WAITING_ROOM)

      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await expect(page.getByText("Players in lobby:")).toBeVisible()
      await expect(page.locator(DRIVER_POPOVER)).not.toBeVisible()
    })
  })

  test.describe.skip("when leaving the driver", () => {
    test("should save the skip value in local storage", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await expect(page.locator(DRIVER_POPOVER)).toBeVisible()
      await page.locator(DRIVER_CLOSE_BTN).click()

      const storageValue = await page.evaluate(
        (key) => localStorage.getItem(key),
        STORAGE_KEYS.DRIVER_WAITING_ROOM
      )
      expect(JSON.parse(storageValue!)).toBe(true)
      await expect(page.locator(DRIVER_POPOVER)).not.toBeVisible()
    })
  })

  test.describe.skip("when reloading after leaving the driver", () => {
    test("should not show the driver again", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await page.evaluate(
        (key) => localStorage.setItem(key, JSON.stringify(true)),
        STORAGE_KEYS.DRIVER_WAITING_ROOM
      )
      await page.reload()

      await expect(page.getByText("Players in lobby:")).toBeVisible()
      await expect(page.locator(DRIVER_POPOVER)).not.toBeVisible()
    })
  })
})
