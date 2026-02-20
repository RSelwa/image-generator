import { expect, test } from "@playwright/test"
import { SELECTORS } from "@/constants/testing"
import { createLobbyViaUI, hideDriverTutorial, loginViaUI, retrieveGamesFromLobby, setupUser, startLobbyViaUI, startSoloLobbyViaUI, waitForInputToBeVisible, waitToBeLogged } from "@/e2e/helpers/lobby"

test.describe("lobby playing", () => {
  test.describe("when is display game", () => {
    test.skip("should not increment points after reload", () => {

    })
  })

  test.describe("when is special round", () => {
    test.skip("should not start the timer while the player has not selected an option", () => {

    })
  })

  test("should play a game until the end",async ({ page }) => {
    test.setTimeout(120_000)
    const user = await setupUser()

    await loginViaUI(page, user.email)

    await hideDriverTutorial(page)

    await page.goto("/")

    await waitToBeLogged(page)

    await createLobbyViaUI(page)

    await page.getByTestId("select-number-rounds-trigger").click()
    await page.getByTestId("select-number-rounds-6-item").click()
    await expect(page.getByTestId("select-number-rounds-trigger")).toHaveText("6")

    const specialRoundsSwitch = page.getByTestId("special-rounds")
    await specialRoundsSwitch.click()
    await expect(specialRoundsSwitch).toBeChecked()

    await startSoloLobbyViaUI(page)

    await waitForInputToBeVisible(page)

    const url = page.url()
    const lobbyId = url.split("/lobby/")[1]

    const games = await retrieveGamesFromLobby(lobbyId)

    // round 1 - all answers correct
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[0].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[0].game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // round 2 - all game answer wrong
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill("wrong answer")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")
    await expect(page.getByTestId(SELECTORS.LIVES_CONTAINER).locator(":nth-child(3)")).toHaveAttribute("data-is-filled", "false")

    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill("wrong answer")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")
    await expect(page.getByTestId(SELECTORS.LIVES_CONTAINER).locator(":nth-child(2)")).toHaveAttribute("data-is-filled", "false")

    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill("wrong answer")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.GAME_THUMBNAIL_TITLE(games[1].game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // round 3 - No pin on map, line should appear and player marker neither but the correct position marker should be visible
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[2].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(61_000)

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[2].game?.title))).toBeVisible()
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue"))).toHaveCount(0)
    await expect(page.getByTestId(SELECTORS.MAP_LINE)).toHaveCount(0)
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("green"))).toHaveCount(1)


    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 4
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[3].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[3].game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 5
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[4].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[4].game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 6 Special round
    await expect(page.getByTestId(SELECTORS.SPECIAL_ROUND)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)

    await page.getByTestId(SELECTORS.GAME_THUMBNAIL_OPTION("0")).click()

    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[5].options?.[0]?.game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.GAME_THUMBNAIL_TITLE(games[5].options?.[0]?.game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    await expect(page.getByTestId(SELECTORS.LOBBY_FINISHED)).toBeVisible()
  })
})
