import { faker } from "@faker-js/faker"
import { expect, type Page } from "@playwright/test"
import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type LobbyDoc, type UserDoc, type userDocWithId, userDocWithIdSchema } from "@repo/schemas"
import { createAuthUser, createFirestoreDoc } from "@repo/testing/emulator"
import { userFactory } from "@repo/testing/factory"
import { createPlayerFromSessionUser } from "@/utils/player"

export const PASSWORD = "cacayolo"

export const setupUser = async (item: Partial<UserDoc> = {}, password?: string) => {
  const user = userFactory({
    email: faker.internet.email({ provider: "yopmail.com" }).toLowerCase(),
    ...item
  })
  const userEmail = user.email
  const userPassword = password || PASSWORD

  const uid = await createAuthUser(userEmail, userPassword)
  await createFirestoreDoc(refs[TABLES.USERS], {
    ...user,
    id: uid,
  })

  const u = await refs[TABLES.USERS].doc(uid).get()

  if (!u.exists) throw new Error("User document was not created")

  return userDocWithIdSchema.parse({ ...u.data(), id: u.id })
}

export const loginViaUI = async (page: Page, email: string) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(PASSWORD)
  await page.getByRole("button", { name: "Login" }).click()
  await expect(page).toHaveURL("/")
  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
}

export const createLobbyViaUI = async (page: Page) => {
  await page.getByRole("button", { name: "Play now!" }).click()
  await page.waitForURL(/\/lobby\//)
  const url = page.url()
  const lobbyId = url.split("/lobby/")[1]

  return lobbyId
}

export const getReadyViaUI = async (page: Page) => {
  await page.getByTestId("ready-button").click()
  await expect(page.getByTestId("ready-button")).toHaveText("Cancel ready")
}

export const startLobbyViaUI = async (page: Page) => {
  await page.getByTestId("start-lobby-button").click()
}

export const createPlayerFromUserDoc = (user: userDocWithId) => createPlayerFromSessionUser({ ...user, photoUrl: "" })

export const createFirestoreLobbyDoc = async (
  lobby: LobbyDoc,
) => await createFirestoreDoc(refs[TABLES.LOBBIES], lobby)
