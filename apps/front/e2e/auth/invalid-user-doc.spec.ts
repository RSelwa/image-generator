import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { createAuthUser } from "@repo/testing/emulator"
import { Timestamp } from "firebase-admin/firestore"
import { PASSWORD, setupUser } from "../helpers/lobby"

const createAuthUserWithCustomDoc = async (
  doc: Record<string, unknown>,
  password?: string,
) => {
  const email = faker.internet.email({ provider: "yopmail.com" }).toLowerCase()
  const uid = await createAuthUser(email, password || PASSWORD)

  // @ts-ignore - Allow passing invalid email formats for testing purposes
  await refs[TABLES.USERS].doc(uid).set(doc)

  return { uid, email }
}

test.describe("invalid user document", () => {
  test("user with missing user doc is logged out and falls back to anonymous", async ({ page }) => {
    const email = faker.internet.email({ provider: "yopmail.com" }).toLowerCase()
    const uid = await createAuthUser(email, PASSWORD)

    // Do NOT create a Firestore user doc — auth exists but doc is missing

    await page.goto("/login")

    await page.waitForTimeout(1000) // Wait a bit to ensure the app has time to check for the user doc and react accordingly
    await refs[TABLES.USERS].doc(uid).delete() // Doc was created when anonymous user signed up, so we need to delete it to simulate the missing doc scenario

    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(PASSWORD)

    await page.getByRole("button", { name: "Login" }).click()

    // Should fall back to anonymous after sign-out
    await expect(page.getByTestId("create-lobby-button-demo")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toHaveCount(0)

    // The original user doc should still not exist
    const userDoc = await refs[TABLES.USERS].doc(uid).get()
    expect(userDoc.exists).toBe(false)
  })

  test("user with null email in doc is logged out and falls back to anonymous", async ({ page }) => {
    const { email } = await createAuthUserWithCustomDoc({
      email: null,
      pseudo: faker.person.fullName(),
      photoUrl: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Login" }).click()

    await expect(page.getByTestId("create-lobby-button-demo")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toHaveCount(0)
  })

  test("user with invalid email format in doc is logged out and falls back to anonymous", async ({ page }) => {
    const { email } = await createAuthUserWithCustomDoc({
      email: "not-an-email",
      pseudo: faker.person.fullName(),
      photoUrl: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Login" }).click()

    await expect(page.getByTestId("create-lobby-button-demo")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toHaveCount(0)
  })

  test("user with valid doc can still login normally", async ({ page }) => {
    const user = await setupUser()

    await page.goto("/login")
    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Login" }).click()

    await expect(page).toHaveURL("/")
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
  })
})
