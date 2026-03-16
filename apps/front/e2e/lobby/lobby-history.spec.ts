import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { expect, test } from "@playwright/test"
import { LOBBY_STATUS } from "@repo/common"
import { lobbyFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import {
  createFirestoreLobbyDoc,
  createPlayerFromUserDoc,
  loginViaUI,
  setupUser,
} from "../helpers/lobby"

test.describe("Lobby History", () => {
  test("should display the history page with finished lobbies", async ({ page }) => {
    const user = await setupUser()
    const player = createPlayerFromUserDoc(user)

    const now = Timestamp.now() as unknown as ClientTimestamp

    const lobby1 = lobbyFactory({
      hostId: user.id,
      players: [player],
      playersIds: [user.id],
      status: LOBBY_STATUS.FINISHED,
      createdAt: now,
      updatedAt: now,
    })

    const lobby2 = lobbyFactory({
      hostId: user.id,
      players: [player],
      playersIds: [user.id],
      status: LOBBY_STATUS.FINISHED,
      createdAt: now,
      updatedAt: now,
    })

    await createFirestoreLobbyDoc(lobby1)
    await createFirestoreLobbyDoc(lobby2)

    await loginViaUI(page, user.email)
    await page.goto("/en/history")

    await expect(page.getByTestId("history-page-title")).toBeVisible()
    await expect(page.getByTestId("lobby-history-list")).toBeVisible()

    const cards = page.getByTestId("lobby-history-card")
    await expect(cards).toHaveCount(2)
  })

  test("should show empty state when no lobbies exist", async ({ page }) => {
    const user = await setupUser()

    await loginViaUI(page, user.email)
    await page.goto("/en/history")

    await expect(page.getByTestId("history-page-title")).toBeVisible()
    await expect(page.getByText("No games played yet.")).toBeVisible()
  })

  test("should only show lobbies where user is a player", async ({ page }) => {
    const user = await setupUser()
    const otherUser = await setupUser()
    const player = createPlayerFromUserDoc(user)
    const otherPlayer = createPlayerFromUserDoc(otherUser)

    const now = Timestamp.now() as unknown as ClientTimestamp

    const myLobby = lobbyFactory({
      hostId: user.id,
      players: [player],
      playersIds: [user.id],
      status: LOBBY_STATUS.FINISHED,
      createdAt: now,
      updatedAt: now,
    })

    const otherLobby = lobbyFactory({
      hostId: otherUser.id,
      players: [otherPlayer],
      playersIds: [otherUser.id],
      status: LOBBY_STATUS.FINISHED,
      createdAt: now,
      updatedAt: now,
    })

    await createFirestoreLobbyDoc(myLobby)
    await createFirestoreLobbyDoc(otherLobby)

    await loginViaUI(page, user.email)
    await page.goto("/en/history")

    await expect(page.getByTestId("history-page-title")).toBeVisible()

    const cards = page.getByTestId("lobby-history-card")
    await expect(cards).toHaveCount(1)
  })

  test("should navigate to history page from nav dropdown", async ({ page }) => {
    const user = await setupUser()

    await loginViaUI(page, user.email)

    await page.getByTestId("nav-user-dropdown-trigger").click()
    await page.getByTestId("nav-history-link").click()

    await expect(page).toHaveURL("/en/history")
    await expect(page.getByTestId("history-page-title")).toBeVisible()
  })

  test("should redirect to login if not authenticated", async ({ page }) => {
    await page.goto("/en/history")

    await expect(page).toHaveURL("/en/login")
  })

  test("should display lobby status badge", async ({ page }) => {
    const user = await setupUser()
    const player = createPlayerFromUserDoc(user)

    const now = Timestamp.now() as unknown as ClientTimestamp

    const finishedLobby = lobbyFactory({
      hostId: user.id,
      players: [player],
      playersIds: [user.id],
      status: LOBBY_STATUS.FINISHED,
      createdAt: now,
      updatedAt: now,
    })

    await createFirestoreLobbyDoc(finishedLobby)

    await loginViaUI(page, user.email)
    await page.goto("/en/history")

    await expect(page.getByTestId("lobby-status-badge")).toHaveText(LOBBY_STATUS.FINISHED)
  })
})
