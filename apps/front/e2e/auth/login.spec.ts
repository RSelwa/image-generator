import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { handleGoogleAuthEmulatorPopup } from "@/e2e/helpers/google-auth"
import { closeModalChangePseudo, logoutViaUI, setupUser, waitForAnonymousAuth } from "@/e2e/helpers/lobby"

test("login with existing user and redirect to home", async ({ page }) => {
  const email = faker.internet.email({ provider: "yopmail.com" }).toLowerCase()
  const password = "cacayolo"

  await setupUser({ email }, password)

  await page.goto("/login")

  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Login" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)
  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
})

test("login with Google provider and redirect to home", async ({ page }) => {
  const email = faker.internet.email({ provider: "yopmail.com" }).toLowerCase()

  await setupUser({ email })

  await page.goto("/login")

  await handleGoogleAuthEmulatorPopup(page, email)

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)
})

test("login with google provider after signing up with email and password", async ({ page }) => {
  const email = faker.internet.email({
    provider: "yopmail.com",
  })

  await waitForAnonymousAuth(page)
  await page.goto("/signup")

  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("cacayolo")
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(page).toHaveURL("/?new-pseudo=")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)

  await closeModalChangePseudo(page)
  await logoutViaUI(page)

  await page.getByTestId("login-button").click()

  await handleGoogleAuthEmulatorPopup(page, email)

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Join" })).toHaveCount(0)
})
