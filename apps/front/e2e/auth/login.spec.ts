import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { createAuthUser, createFirestoreDoc } from "@repo/testing/emulator"

test("login with existing user and redirect to home", async ({ page }) => {
  const email = faker.internet.email({ provider: "yopmail.com" }).toLowerCase()
  const password = "cacayolo"

  const uid = await createAuthUser(email, password)
  await createFirestoreDoc(TABLES.USERS, uid, {
    email: { stringValue: email },
    name: { stringValue: "" },
  })

  await page.goto("/login")

  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Login" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)
  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
})
