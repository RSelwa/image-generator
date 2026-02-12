import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { lobbyFactory, roundFactory, seedFactory } from "@repo/testing/factory"
import {
  createFirestoreLobbyDoc,
  createLobbyViaUI,
  createPlayerFromUserDoc,
  loginViaUI,
  PASSWORD,
  setupUser,
  waitForAnonymousAuth,
} from "../helpers/lobby"

test.describe("lobby Waiting", () => {
  test.describe("when closing the tab", () => {
    test.skip("should remove me from the players", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)

      const lobbyId = await createLobbyViaUI(page)
      const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobbyId).get()

      expect(lobbyDoc.data()?.players.map((player) => player.uid)).toContain(user.id)

      await page.close({ runBeforeUnload: true })

      const removedDoc = await refs[TABLES.LOBBIES].doc(lobbyId).get()

      expect(removedDoc.data()?.players.map((player) => player.uid)).not.toContain(user.id)
    })
  })

  test.describe("when changing tab", () => {
    test("should remove me from the players", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)

      const lobbyId = await createLobbyViaUI(page)
      const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobbyId).get()

      expect(lobbyDoc.data()?.players.map((player) => player.uid)).toContain(user.id)

      await page.goto("/")
      const removedDoc = await refs[TABLES.LOBBIES].doc(lobbyId).get()

      expect(removedDoc.data()?.players.map((player) => player.uid)).not.toContain(user.id)
    })
  })

  test.describe("When lobby host", () => {
    test("Can create a lobby when logged", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)

      await page.getByRole("button", { name: "Play now!" }).click()
      await page.waitForURL(/\/lobby\//)

      await expect(page.getByText("Players in lobby:")).toBeVisible()
      await expect(page.getByText("Config")).toBeVisible()
      await expect(page.getByRole("button", { name: "Start Lobby" })).toBeVisible()
    })

    test("can modify a lobby config if host", async ({ page }) => {
      const user = await setupUser()
      await loginViaUI(page, user.email)
      await createLobbyViaUI(page)

      await page.getByTestId("select-number-rounds-trigger").click()
      await page.getByTestId("select-number-rounds-6-item").click()

      await expect(page.getByTestId("select-number-rounds-trigger")).toHaveText("6")

      const specialRoundsSwitch = page.getByTestId("special-rounds")
      await specialRoundsSwitch.click()

      await expect(specialRoundsSwitch).toBeChecked()
    })

    test("can start a game if everyone is ready", async ({ page }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [
          { ...playerHost, isReady: true },
          { ...player2Player, isReady: true },
        ]
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      const startButton = page.getByRole("button", { name: "Start Lobby" })
      await expect(startButton).toBeEnabled()
    })

    test("can not start if not everyone is ready", async ({ page }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player]
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      const startButton = page.getByRole("button", { name: "Start Lobby" })
      await expect(startButton).toBeDisabled()
    })

    test("can paste a seedId and have config updated", async ({ page }) => {
      const host = await setupUser()

      const rounds = Array.from({ length: 6 }, (_, i) =>
        roundFactory({ isSpecial: i === 0 || i === 3 }))

      const seed = seedFactory({ rounds })
      await createFirestoreDoc(refs[TABLES.SEEDS], seed)

      await loginViaUI(page, host.email)
      await createLobbyViaUI(page)

      const seedInput = page.getByTestId("seed-input")
      await seedInput.fill(seed.id)
      await seedInput.press("Control+a")
      await seedInput.evaluate((el, value) => {
        const input = el as HTMLInputElement
        input.value = value
        const event = new Event("input", { bubbles: true })
        input.dispatchEvent(event)
        const clipboardData = new DataTransfer()
        clipboardData.setData("text/plain", value)
        const pasteEvent = new ClipboardEvent("paste", { bubbles: true, clipboardData })
        input.dispatchEvent(pasteEvent)
      }, seed.id)

      await expect(page.getByTestId("select-number-rounds-trigger")).toHaveText("6", { timeout: 10000 })
      await expect(page.getByTestId("select-number-rounds-trigger")).toBeDisabled()

      const specialRoundsSwitch = page.getByTestId("special-rounds")
      await expect(specialRoundsSwitch).toBeChecked()
      await expect(specialRoundsSwitch).toBeDisabled()

      await expect(seedInput).toHaveValue(seed.id)
    })
  })

  test.describe("When not lobby host", () => {
    test("can not modify a lobby config", async ({ page }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player]
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, player2.email)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      const selects = page.locator("[role='combobox']")
      const selectCount = await selects.count()

      for (let i = 0; i < selectCount; i++) {
        await expect(selects.nth(i)).toBeDisabled()
      }

      await expect(page.locator("#special-rounds")).toBeDisabled()
    })

    test("can put my self ready", async ({ browser }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player]
      })

      await createFirestoreLobbyDoc(lobby)

      const context = await browser.newContext()
      const page = await context.newPage()

      await loginViaUI(page, player2.email)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Ready: 0/2")).toBeVisible()

      await page.getByRole("button", { name: "I'm ready" }).click()

      await expect(page.getByText("Ready: 1/2")).toBeVisible()
      await expect(page.getByRole("button", { name: "Cancel ready" })).toBeVisible()

      await context.close()
    })

    test("have the config changes in UI when the lobbyDoc is changing", async ({ browser }) => {
      const host = await setupUser()
      const player2 = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(player2)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player]
      })

      await createFirestoreLobbyDoc(lobby)

      const hostContext = await browser.newContext()
      const hostPage = await hostContext.newPage()
      await loginViaUI(hostPage, host.email)
      await hostPage.goto(`/lobby/${lobby.id}`)

      const playerContext = await browser.newContext()
      const playerPage = await playerContext.newPage()
      await loginViaUI(playerPage, player2.email)
      await playerPage.goto(`/lobby/${lobby.id}`)

      await expect(playerPage.getByText("Players in lobby:")).toBeVisible()

      const numberOfRoundsSelect = hostPage.locator("[role='combobox']").first()
      await numberOfRoundsSelect.click()
      await hostPage.getByRole("option", { name: "6" }).click()

      await expect(playerPage.getByText("6")).toBeVisible({ timeout: 5000 })

      await hostContext.close()
      await playerContext.close()
    })
  })

  test.describe("When joining a lobby with the url", () => {
    test("Should be redirected to the lobby page if already connected", async ({ browser }) => {
      const host = await setupUser()
      const joiner = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const player2Player = createPlayerFromUserDoc(joiner)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost, player2Player]
      })

      await createFirestoreLobbyDoc(lobby)

      const context = await browser.newContext()
      const page = await context.newPage()

      await loginViaUI(page, joiner.email)

      await page.goto(`/join-lobby/${lobby.code}`)

      await expect(page).toHaveURL(`/lobby/${lobby.id}`, { timeout: 10000 })
      await expect(page.getByText("Players in lobby: 2/8")).toBeVisible()

      await context.close()
    })

    test("should be redirected to login page if not connected", async ({ page }) => {
      const host = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost,
        ]
      })

      await createFirestoreLobbyDoc(lobby)

      await page.goto(`/join-lobby/${lobby.code}`)

      await expect(page).toHaveURL(new RegExp(`/login.*redirect.*join-lobby.*${lobby.code}`), { timeout: 10000 })
    })

    test("after being redirected to login, login and should be redirected and visible in the lobby", async ({ page }) => {
      const host = await setupUser()
      const joiner = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)
      const joinerPlayer = createPlayerFromUserDoc(joiner)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [
          playerHost,
          joinerPlayer,
        ]
      })

      await createFirestoreLobbyDoc(lobby)

      await page.goto(`/join-lobby/${lobby.code}`)

      await expect(page).toHaveURL(new RegExp(`/login.*redirect.*join-lobby.*${lobby.code}`), { timeout: 10000 })

      await page.getByLabel("Email").fill(joiner.email)
      await page.getByLabel("Password").fill(PASSWORD)
      await page.getByRole("button", { name: "Login" }).click()

      await expect(page).toHaveURL(`/lobby/${lobby.id}`, { timeout: 10000 })
      await expect(page.getByText("Players in lobby: 2/8")).toBeVisible()
    })

    test("after being redirected to login, click on signup, create an account and should be redirected and visible in the lobby", async ({ page }) => {
      const host = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)

      const lobby = lobbyFactory({
        hostId: host.id,
        players: [playerHost]
      })

      await createFirestoreLobbyDoc(lobby)
      await waitForAnonymousAuth(page)

      await page.goto(`/join-lobby/${lobby.code}`)

      await expect(page).toHaveURL(new RegExp(`/login.*redirect.*join-lobby.*${lobby.code}`), { timeout: 10000 })

      await page.getByRole("link", { name: "Sign up" }).click()

      await expect(page).toHaveURL(new RegExp(`/signup.*redirect.*join-lobby.*${lobby.code}`))

      const newEmail = faker.internet.email({ provider: "yopmail.com" })
      await page.getByLabel("Email").fill(newEmail)
      await page.getByLabel("Password").fill("cacayolo")
      await page.getByRole("button", { name: "Create Account" }).click()

      await expect(page).toHaveURL(`/lobby/${lobby.id}`, { timeout: 10000 })
      await expect(page.getByText("Players in lobby: 2/8")).toBeVisible()
    })
  })
})
