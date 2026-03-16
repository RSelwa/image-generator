import { expect, test } from "@playwright/test"
import { dateToString, getYesterday } from "@repo/common"
import { SELECTORS } from "@/constants/testing"
import {
  getUserStreak,
  setupDailyChallengesForPath,
  setUserStreak,
} from "@/e2e/helpers/daily-challenge"
import { loginViaUI, setupUser } from "@/e2e/helpers/lobby"

const today = dateToString(new Date())

const getDateString = (daysOffset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)

  return dateToString(date)
}

test.describe("daily challenge streak", () => {
  test("should increment streak when answering today with yesterday's streak", async ({ page }) => {
    const user = await setupUser()
    const challenges = await setupDailyChallengesForPath()
    const todayChallenge = challenges.find((c) => c.date === today)

    // Set streak as if user answered yesterday
    const yesterday = getYesterday(today)
    await setUserStreak(user.id, 3, yesterday)

    await loginViaUI(page, user.email)
    await page.goto(`/en/daily-challenge/${today}`)

    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(todayChallenge?.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toBeVisible({ timeout: 10_000 })

    // Streak badge should show 4 in the modal
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toContainText("4")

    // Verify Firestore was updated
    const { streak, lastStreakDate } = await getUserStreak(user.id)
    expect(streak).toBe(4)
    expect(lastStreakDate).toBe(today)
  })

  test("should reset streak to 1 when user has old streak from the past", async ({ page }) => {
    const user = await setupUser()
    const challenges = await setupDailyChallengesForPath()
    const todayChallenge = challenges.find((c) => c.date === today)

    // Set streak as if user had a streak a week ago
    const aWeekAgo = getDateString(-7)
    await setUserStreak(user.id, 5, aWeekAgo)

    await loginViaUI(page, user.email)
    await page.goto(`/en/daily-challenge/${today}`)

    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(todayChallenge?.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toBeVisible({ timeout: 10_000 })

    // Streak badge should show 1 (reset)
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toContainText("1")

    // Verify Firestore was updated
    const { streak, lastStreakDate } = await getUserStreak(user.id)
    expect(streak).toBe(1)
    expect(lastStreakDate).toBe(today)
  })

  test("should not update streak when answering a past challenge", async ({ page }) => {
    const user = await setupUser()
    const challenges = await setupDailyChallengesForPath()
    const yesterdayDate = getDateString(-1)
    const yesterdayChallenge = challenges.find((c) => c.date === yesterdayDate)

    // Set existing streak
    const twoDaysAgo = getDateString(-2)
    await setUserStreak(user.id, 3, twoDaysAgo)

    await loginViaUI(page, user.email)
    await page.goto(`/en/daily-challenge/${yesterdayDate}`)

    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10_000 })
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(yesterdayChallenge?.gameTitle || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.DAILY_CHALLENGE_SHARE_MODAL)).toBeVisible({ timeout: 10_000 })

    // Streak should NOT have been updated — still 3 from two days ago
    const { streak, lastStreakDate } = await getUserStreak(user.id)
    expect(streak).toBe(3)
    expect(lastStreakDate).toBe(twoDaysAgo)
  })

  test("should not show streak badge on path page when streak is stale", async ({ page }) => {
    const user = await setupUser()
    await setupDailyChallengesForPath()

    // Set an old streak that should visually reset
    const aWeekAgo = getDateString(-7)
    await setUserStreak(user.id, 5, aWeekAgo)

    await loginViaUI(page, user.email)
    await page.goto("/en/daily-challenge")

    // Streak badge should NOT be visible (stale streak)
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toHaveCount(0)
  })

  test("should show streak badge on path page when streak is active", async ({ page }) => {
    const user = await setupUser()
    await setupDailyChallengesForPath()

    // Set active streak (answered today)
    await setUserStreak(user.id, 3, today)

    await loginViaUI(page, user.email)
    await page.goto("/en/daily-challenge")

    // Streak badge should be visible
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.STREAK_BADGE)).toContainText("3")
  })
})
