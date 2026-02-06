import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"

test("signup and redirect to home", async ({ page }) => {
  const email = faker.internet.email({
    provider: "yopmail.com",
  })
  await page.goto("/signup")

  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("cacayolo")
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)

  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
})
