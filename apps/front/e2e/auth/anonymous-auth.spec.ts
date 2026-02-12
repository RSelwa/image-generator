import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { SELECTORS } from "@/constants/testing"
import { PASSWORD, setupUser, waitForAnonymousAuth } from "../helpers/lobby"

test.describe("anonymous auth", () => {
  test("anonymous user can sign up with a new email", async ({ page }) => {
    const uid = await waitForAnonymousAuth(page)

    await page.goto("/signup")

    const email = faker.internet.email({ provider: "yopmail.com" })
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Create Account" }).click()

    await expect(page).toHaveURL("?new-pseudo=")
    await expect(page.getByTestId(SELECTORS.CHANGE_PSEUDO_MODAL)).toBeVisible()
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()

    // The UID should remain the same (linkWithCredential preserves it)
    const userDoc = await refs[TABLES.USERS].doc(uid).get()
    expect(userDoc.exists).toBe(true)
    expect(userDoc.data()?.email).toBe(email.toLowerCase())
  })

  test("anonymous user can not sign up with an already used email", async ({ page }) => {
    const existingUser = await setupUser()

    await waitForAnonymousAuth(page)

    await page.goto("/signup")

    await page.getByLabel("Email").fill(existingUser.email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Create Account" }).click()

    await expect(page.getByText("An account with this email already exists. Please log in instead.")).toBeVisible()
  })

  test("anonymous user can login with existing credentials", async ({ page }) => {
    const existingUser = await setupUser()

    await waitForAnonymousAuth(page)

    await page.goto("/login")

    await page.getByLabel("Email").fill(existingUser.email)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: "Login" }).click()

    await expect(page).toHaveURL("/", { timeout: 10000 })
    await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()

    // Existing user doc should still exist
    const existingDoc = await refs[TABLES.USERS].doc(existingUser.id).get()
    expect(existingDoc.exists).toBe(true)
  })
})
