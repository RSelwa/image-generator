import { faker } from "@faker-js/faker"
import { expect, type Page, test } from "@playwright/test"
import { ACHIEVEMENT_DIFFICULTY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type AchievementDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"

const seedAchievement = async () => {
  const achievement = {
    key: `e2e_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    reward: 50,
    difficulty: ACHIEVEMENT_DIFFICULTY.EASY,
  } satisfies AchievementDoc
  await refs[TABLES.ACHIEVEMENTS].doc(achievement.key).set(achievement)

  return achievement
}

const enableAchievementsFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.ACHIEVEMENTS)

const getCard = (page: Page, key: string) =>
  page.getByTestId(SELECTORS.ACHIEVEMENTS_ITEM(key)).locator("[data-unlocked]")

test.describe("when the achievements flag is disabled", () => {
  test("should hide the achievements menu tab", async ({ page }) => {
    const user = await setupUser()

    await loginViaUI(page, user.email)
    await page.getByTestId(SELECTORS.NAV_USER_DROPDOWN_TRIGGER).click()

    await expect(page.getByTestId("nav-history-link")).toBeVisible()
    await expect(page.getByTestId(SELECTORS.NAV_ACHIEVEMENTS)).toHaveCount(0)
  })

  test("should redirect the achievements page home", async ({ page }) => {
    await page.goto("/en/achievements")

    await expect(page).toHaveURL("/en")
  })
})

test.describe("when the achievements flag is enabled", () => {
  test("should show the achievements menu tab", async ({ page }) => {
    const user = await setupUser()
    await enableAchievementsFlag(page)

    await loginViaUI(page, user.email)
    await page.getByTestId(SELECTORS.NAV_USER_DROPDOWN_TRIGGER).click()

    await expect(page.getByTestId(SELECTORS.NAV_ACHIEVEMENTS)).toHaveAttribute(
      "href",
      "/en/achievements",
    )
  })

  test("should list the achievements with the unlocked ones marked", async ({
    page,
  }) => {
    const [locked, unlocked] = await Promise.all([
      seedAchievement(),
      seedAchievement(),
    ])
    const user = await setupUser()
    await subRefs[TABLES.UNLOCKED_ACHIEVEMENTS](user.id)
      .doc(unlocked.key)
      .set({ achievedAt: Timestamp.now(), reward: unlocked.reward })
    await enableAchievementsFlag(page)

    await loginViaUI(page, user.email)
    await page.goto("/en/achievements")

    await expect(getCard(page, locked.key)).toHaveAttribute(
      "data-unlocked",
      "false",
    )
    await expect(getCard(page, unlocked.key)).toHaveAttribute(
      "data-unlocked",
      "true",
    )
  })
})
