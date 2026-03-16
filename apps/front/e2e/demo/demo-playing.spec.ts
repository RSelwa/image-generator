import { expect, test } from "@playwright/test"
import { LOBBY_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { SELECTORS } from "@/constants/testing"
import { hideDriverTutorial, retrieveGamesFromLobby, waitForAnonymousAuth, waitForInputToBeVisible } from "@/e2e/helpers/lobby"

test.describe("demo playing", () => {
  test("should play a demo game until the end", async ({ page }) => {
    test.setTimeout(120_000)

    await waitForAnonymousAuth(page)

    await hideDriverTutorial(page)

    await page.getByTestId("video-create-lobby-button-demo").click()

    await page.waitForURL("/en/lobby/**")

    const url = page.url()
    const lobbyId = url.split("/lobby/")[1]

    await waitForInputToBeVisible(page)

    const games = await retrieveGamesFromLobby(lobbyId)

    // round 1 - correct game guess + correct map location
    console.info("Round 1 - correct game guess + correct map location")
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[0].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[0].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // round 2 - wrong game answers (lose all 3 lives)
    console.info("round 2 - wrong game answers (lose all 3 lives)")
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

    // round 3 - correct game guess + correct map location
    console.info("round 3 - correct game guess + correct map location")
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[2].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[2].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 4 - correct game guess by alternatives name + correct map location
    console.info("round 4 - correct game guess by alternatives name + correct map location")
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[3].game?.alternateNames?.[0] || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[3].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 5 - correct game guess + correct map location
    console.info("round 5 - correct game guess + correct map location")
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[4].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[4].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // round 6 - special round
    console.info("round 6 - special round")
    await expect(page.getByTestId(SELECTORS.SPECIAL_ROUND)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)

    await page.getByTestId(SELECTORS.GAME_THUMBNAIL_OPTION("0")).click()

    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[5].options?.[0]?.game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.GAME_THUMBNAIL_TITLE(games[5].options?.[0]?.game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    await expect(page.getByTestId(SELECTORS.LOBBY_FINISHED)).toBeVisible()

    const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobbyId).get()
    expect(lobbyDoc.data()?.status).toBe(LOBBY_STATUS.FINISHED)

    await expect(page.getByTestId(SELECTORS.FINISHED_LOBBY_ANONYMOUS_MODAL)).toBeVisible()
  })
})
