import { expect, test } from "@playwright/test"
import { dateToString } from "@repo/common"
import { DAILY_CHALLENGES_VARIANTS } from "@/constants/daily-challenges"
import { SELECTORS } from "@/constants/testing"
import {
  setupDailyChallengesForPath,
  setupFlatWithMapChallenge,
  setupFlatWithoutMapChallenge,
  setupSphericalWithMapChallenge,
  setupSphericalWithoutMapChallenge,
} from "@/e2e/helpers/daily-challenge"
import { loginViaUI, setupUser } from "@/e2e/helpers/lobby"

const today = dateToString(new Date())

const getDateString = (daysOffset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)

  return dateToString(date)
}

test.describe("daily challenge path", () => {
  test("should display challenges and verify completion flow", async ({ page }) => {
    const user = await setupUser()
    const challenges = await setupDailyChallengesForPath()
    await loginViaUI(page, user.email)

    await page.goto("/en/daily-challenge")

    // Verify today's challenge node is visible with TODAY variant
    const todayChallenge = challenges.find((c) => c.date === today)
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(today, DAILY_CHALLENGES_VARIANTS.TODAY))).toBeVisible()

    // Verify past challenges are visible with AVAILABLE variant
    for (let i = 1; i <= 4; i++) {
      const date = getDateString(-i)
      const challenge = challenges.find((c) => c.date === date)

      if (challenge) {
        await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(date, DAILY_CHALLENGES_VARIANTS.AVAILABLE))).toBeVisible()
      }
    }

    // Complete today's challenge
    await page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(today, DAILY_CHALLENGES_VARIANTS.TODAY)).click()
    await expect(page).toHaveURL(`/en/daily-challenge/${today}`)

    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(todayChallenge?.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    // After correct answer, the game thumbnail should appear and the input should disappear
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_RESULT_THUMBNAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)

    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toBeVisible()
    await page.getByTestId(SELECTORS.DIALOG_CLOSE).click({ force: true })
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toHaveCount(0)

    // Go back to the daily challenge path
    await page.getByTestId(SELECTORS.DAILY_CHALLENGE_BACK).click()
    await expect(page).toHaveURL("/en/daily-challenge")

    // Today's node should now have COMPLETED_TODAY variant
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(today, DAILY_CHALLENGES_VARIANTS.COMPLETED_TODAY))).toBeVisible()

    // Complete a past challenge
    const yesterdayDate = getDateString(-1)
    const yesterdayChallenge = challenges.find((c) => c.date === yesterdayDate)

    await page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(yesterdayDate, DAILY_CHALLENGES_VARIANTS.AVAILABLE)).click()
    await expect(page).toHaveURL(`/en/daily-challenge/${yesterdayDate}`)

    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(yesterdayChallenge?.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toBeVisible()
    await page.getByTestId(SELECTORS.DIALOG_CLOSE).click({ force: true })
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toHaveCount(0)

    // Go back and verify COMPLETED variant for yesterday
    await page.getByTestId(SELECTORS.DAILY_CHALLENGE_BACK).click()
    await expect(page).toHaveURL("/en/daily-challenge")
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_NODE(yesterdayDate, DAILY_CHALLENGES_VARIANTS.COMPLETED))).toBeVisible()
  })
})

test.describe("daily challenge 2x2 matrix - playability", () => {
  test("spherical with map: should be playable", async ({ page }) => {
    const user = await setupUser()
    const challenge = await setupSphericalWithMapChallenge(today)
    await loginViaUI(page, user.email)

    await page.goto(`/en/daily-challenge/${today}`)

    // Spherical image should render (canvas-based ReactSphere)
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SPHERICAL)).toBeVisible({ timeout: 10_000 })

    // Input should be visible
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })

    await page.waitForTimeout(1000) // Wait a bit to ensure any lazy loading is done before interacting

    // Submit correct answer
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(challenge.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    // Completion: thumbnail visible, input gone
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_RESULT_THUMBNAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)
  })

  test("spherical without map: should be playable", async ({ page }) => {
    const user = await setupUser()
    const challenge = await setupSphericalWithoutMapChallenge(today)
    await loginViaUI(page, user.email)

    await page.goto(`/en/daily-challenge/${today}`)

    // Spherical image should render
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SPHERICAL)).toBeVisible({ timeout: 10_000 })

    // Input should be visible
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })

    await page.waitForTimeout(1000) // Wait a bit to ensure any lazy loading is done before interacting

    // Submit correct answer
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(challenge.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    // Completion
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_RESULT_THUMBNAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)
  })

  test("flat with map: should be playable", async ({ page }) => {
    const user = await setupUser()
    const challenge = await setupFlatWithMapChallenge(today)
    await loginViaUI(page, user.email)

    await page.goto(`/en/daily-challenge/${today}`)

    // Flat image should render
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_FLAT)).toBeVisible({ timeout: 10_000 })

    // Input should be visible
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })

    await page.waitForTimeout(1000) // Wait a bit to ensure any lazy loading is done before interacting

    // Submit correct answer
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(challenge.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    // Completion
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_RESULT_THUMBNAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)
  })

  test("flat without map: should be playable", async ({ page }) => {
    const user = await setupUser()
    const challenge = await setupFlatWithoutMapChallenge(today)
    await loginViaUI(page, user.email)

    await page.goto(`/en/daily-challenge/${today}`)

    // Flat image should render
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_FLAT)).toBeVisible({ timeout: 10_000 })

    // Input should be visible
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })

    await page.waitForTimeout(1000) // Wait a bit to ensure any lazy loading is done before interacting

    // Submit correct answer
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(challenge.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    // Completion
    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_RESULT_THUMBNAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)
  })
})
