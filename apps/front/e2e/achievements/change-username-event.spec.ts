import { faker } from "@faker-js/faker"
import { expect, type Page, test } from "@playwright/test"
import { ACHIEVEMENT_KEYS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { API_ENDPOINTS, MODAL_KEYS } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"

const REWARD = 50

const enableAchievementsFlag = (page: Page) =>
  page.addInitScript((flag) => {
    localStorage.setItem(flag, JSON.stringify(true))
  }, FEATURE_FLAGS.ACHIEVEMENTS)

const trackAchievementEvents = (page: Page) => {
  const requests: string[] = []
  page.on("request", (request) => {
    if (request.url().endsWith(API_ENDPOINTS.ACHIEVEMENT_EVENTS)) {
      requests.push(request.url())
    }
  })

  return requests
}

const changePseudoViaUI = async (page: Page, uid: string) => {
  const pseudo = faker.string.alphanumeric({ length: 12, casing: "lower" })

  await page.goto(`/en?${MODAL_KEYS.CHANGE_PSEUDO}=`)
  await page.getByTestId(SELECTORS.CHANGE_PSEUDO_INPUT).fill(pseudo)
  await page.getByTestId(SELECTORS.CHANGE_PSEUDO_SUBMIT).click()

  await expect(page.getByTestId(SELECTORS.CHANGE_PSEUDO_MODAL)).toHaveCount(0)
  await expect
    .poll(async () => (await refs[TABLES.USERS].doc(uid).get()).data()?.pseudo)
    .toBe(pseudo)
}

const getCredits = async (uid: string) =>
  (await refs[TABLES.USERS].doc(uid).get()).data()?.credits

const getUnlocked = async (uid: string) =>
  (
    await subRefs[TABLES.UNLOCKED_ACHIEVEMENTS](uid)
      .doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME)
      .get()
  ).data()

test.beforeEach(async () => {
  await refs[TABLES.ACHIEVEMENTS].doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME).set({
    key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
    name: "New identity",
    description: "Change your username",
    reward: REWARD,
  })
})

test.describe("when the achievements flag is enabled", () => {
  test("should pay the reward only once across two username changes", async ({
    page,
  }) => {
    const user = await setupUser()
    await enableAchievementsFlag(page)
    await loginViaUI(page, user.email)

    await changePseudoViaUI(page, user.id)

    await expect
      .poll(() => getUnlocked(user.id))
      .toMatchObject({
        reward: REWARD,
      })
    await expect.poll(() => getCredits(user.id)).toBe(REWARD)

    await changePseudoViaUI(page, user.id)

    expect(await getCredits(user.id)).toBe(REWARD)
  })
})

test.describe("when the achievements flag is disabled", () => {
  test("should not send the username change event", async ({ page }) => {
    const user = await setupUser()
    const requests = trackAchievementEvents(page)
    await loginViaUI(page, user.email)

    await changePseudoViaUI(page, user.id)

    expect(requests).toHaveLength(0)
    expect(await getUnlocked(user.id)).toBeUndefined()
    expect(await getCredits(user.id)).toBe(0)
  })
})
