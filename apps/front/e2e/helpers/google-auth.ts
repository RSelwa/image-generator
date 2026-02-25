import { expect, type Page } from "@playwright/test"

export const handleGoogleAuthEmulatorPopup = async (page: Page, email: string) => {
  const popupPromise = page.waitForEvent("popup")

  await page.getByRole("button", { name: "Sign up with Google" }).click()

  const popup = await popupPromise
  await popup.waitForLoadState()

  await popup.getByText("Add new account").click()
  await popup.getByLabel("Email").fill(email)
  await popup.getByText("Sign in with").click()

  await popup.waitForEvent("close")

  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
}
