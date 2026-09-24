import { faker } from "@faker-js/faker"
import { expect, type Page, test } from "@playwright/test"
import { ACHIEVEMENT_DIFFICULTY, TABLES, USER_RIGHT } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type Achievement, achievementDocSchema } from "@repo/schemas"
import { NO_ACHIEVEMENT_DIFFICULTY } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"

const buildAchievement = () =>
  ({
    key: `e2e_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    reward: 50,
    difficulty: ACHIEVEMENT_DIFFICULTY.EASY,
  }) satisfies Achievement

const seedAchievement = async () => {
  const achievement = buildAchievement()
  await refs[TABLES.ACHIEVEMENTS]
    .doc(achievement.key)
    .set(achievementDocSchema.parse(achievement))

  return achievement
}

const getAchievement = async (key: string) => {
  const snapshot = await refs[TABLES.ACHIEVEMENTS].doc(key).get()

  return snapshot.data()
}

const loginAsAdmin = async (page: Page) => {
  const admin = await setupUser()
  await refs[TABLES.RIGHTS]
    .doc(admin.id)
    .set({ uid: admin.id, right: USER_RIGHT.ADMIN })
  await loginViaUI(page, admin.email)
  await page.getByTestId(SELECTORS.NAV_USER_DROPDOWN_TRIGGER).click()
  await page.getByTestId(SELECTORS.ADMIN_MENU_TRIGGER).click()
  await page.getByTestId(SELECTORS.ADMIN_MENU_ACHIEVEMENTS).click()
}

test.describe("when an admin manages achievements", () => {
  test("should list the existing achievements", async ({ page }) => {
    const achievement = await seedAchievement()

    await loginAsAdmin(page)

    await expect(
      page.getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key)),
    ).toBeVisible()
  })

  test("should create an achievement under its key", async ({ page }) => {
    const achievement = buildAchievement()

    await loginAsAdmin(page)
    await page.getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_NEW).click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_KEY).fill(achievement.key)
    await page
      .getByTestId(SELECTORS.ACHIEVEMENT_FORM_NAME)
      .fill(achievement.name)
    await page
      .getByTestId(SELECTORS.ACHIEVEMENT_FORM_DESCRIPTION)
      .fill(achievement.description)
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_REWARD).fill("120")
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_GOAL).fill("3")
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY).click()
    await page
      .getByTestId(
        SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY_OPTION(
          ACHIEVEMENT_DIFFICULTY.LEGENDARY,
        ),
      )
      .click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_SUBMIT).click()

    await expect(
      page.getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key)),
    ).toBeVisible()
    expect(await getAchievement(achievement.key)).toEqual({
      name: achievement.name,
      description: achievement.description,
      reward: 120,
      goalToAchieve: 3,
      difficulty: ACHIEVEMENT_DIFFICULTY.LEGENDARY,
    })
  })

  test("should refuse to overwrite an existing key", async ({ page }) => {
    const achievement = await seedAchievement()

    await loginAsAdmin(page)
    await page.getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_NEW).click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_KEY).fill(achievement.key)
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_NAME).fill("Overwritten")
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_SUBMIT).click()

    await expect(
      page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_KEY_ERROR),
    ).toBeVisible()
    expect(await getAchievement(achievement.key)).toEqual(
      achievementDocSchema.parse(achievement),
    )
  })

  test("should edit an achievement without changing its key", async ({
    page,
  }) => {
    const achievement = await seedAchievement()

    await loginAsAdmin(page)
    await page
      .getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key))
      .click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_NAME).fill("Renamed")
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_REWARD).fill("75")
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY).click()
    await page
      .getByTestId(
        SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY_OPTION(NO_ACHIEVEMENT_DIFFICULTY),
      )
      .click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_SUBMIT).click()

    await expect(
      page.getByTestId(SELECTORS.ACHIEVEMENT_FORM_KEY),
    ).toHaveAttribute("readonly")
    await expect
      .poll(() => getAchievement(achievement.key))
      .toEqual({
        name: "Renamed",
        description: achievement.description,
        reward: 75,
      })
  })

  test("should delete an achievement", async ({ page }) => {
    const achievement = await seedAchievement()

    await loginAsAdmin(page)
    await page
      .getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key))
      .click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_DELETE).click()
    await page.getByTestId(SELECTORS.ACHIEVEMENT_DELETE_CONFIRM).click()

    await expect(
      page.getByTestId(SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key)),
    ).toBeHidden()
    expect(await getAchievement(achievement.key)).toBeUndefined()
  })
})
