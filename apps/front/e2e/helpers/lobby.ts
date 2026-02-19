import { faker } from "@faker-js/faker"
import { expect, type Page } from "@playwright/test"
import { generateUsername, PREFIX_ANONYMOUS_USER, SUFFIX_ANONYMOUS_USER, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type LobbyDoc, type UserDoc, type userDocWithId, userDocWithIdSchema } from "@repo/schemas"
import { userDocSchema } from "@repo/schemas"
import { createAuthUser, createFirestoreDoc } from "@repo/testing/emulator"
import { userFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { SELECTORS } from "@/constants/testing"
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

export const waitToBeLogged = async (page: Page) => {
  await expect(page.getByTestId("nav-user-dropdown-trigger")).toBeVisible()
}

export const createLobbyViaUI = async (page: Page) => {
  await page.getByTestId("create-lobby-button").click()

  await page.waitForURL(/\/lobby\//)
  const url = page.url()
  const lobbyId = url.split("/lobby/")[1]

  return lobbyId
}

export const startSoloLobbyViaUI = async (page: Page) => {
  await page.getByTestId("start-lobby-button-solo").click()
}

export const getReadyViaUI = async (page: Page) => {
  await page.getByTestId("ready-button").click()
  await expect(page.getByTestId("ready-button")).toHaveText("Cancel ready")
}

export const startLobbyViaUI = async (page: Page) => {
  await page.getByTestId("start-lobby-button").click()
}

export const waitForInputToBeVisible = async (page: Page) =>
  await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible({ timeout: 10000 })

export const createPlayerFromUserDoc = (user: userDocWithId) => createPlayerFromSessionUser({ ...user, pseudo: user.pseudo || "", photoUrl: "", isAnonymous: false })

export const createFirestoreLobbyDoc = async (
  lobby: LobbyDoc,
) => await createFirestoreDoc(refs[TABLES.LOBBIES], lobby)

export const retrieveGamesFromLobby = async (lobbyId: string) => {
  const lobby = await refs[TABLES.LOBBIES].doc(lobbyId).get()

  if (!lobby.exists) throw new Error("Lobby document does not exist")

  const lobbyData = lobby.data()

  const seedId = lobbyData?.seedId

  if (!seedId) throw new Error("Lobby document does not have a seedId")

  const seed = await refs[TABLES.SEEDS].doc(seedId).get()

  const rounds = seed.data()?.rounds

  if (!rounds) throw new Error("Seed document does not have rounds")

  const allGamesIds = rounds.map((round) => {
    if (round.gameId) return { gameId: round.gameId, options: null }

    if (round.options) return { gameId: null, options: round.options.map((option) => ({ gameId: option.gameId })) }

    return { gameId: null, options: null }
  })

  const allGames = []

  for (const round of allGamesIds) {
    const { gameId, options } = round

    if (gameId) {
      const gameDoc = await refs[TABLES.GAMES].doc(gameId).get()

      allGames.push({ game: { id: gameDoc.id, ...gameDoc.data() }, options: null })
    }

    if (options) {
      const optionsGames = []

      for (const option of options) {
        const gameDoc = await refs[TABLES.GAMES].doc(option.gameId).get()

        optionsGames.push({ game: { id: gameDoc.id, ...gameDoc.data() } })
      }

      allGames.push({ game: null, options: optionsGames })
    }
  }

  return allGames
}

const getAnonymousUid = async (page: Page) =>
  page.evaluate(() => (window as any).__store__?.getState()?.session?.user?.id as string | null)

export const createAnonymousUserDoc = async (uid: string) => {
  const now = Timestamp.now()
  const userDoc = userDocSchema.parse({
    email: `${PREFIX_ANONYMOUS_USER}${uid}${SUFFIX_ANONYMOUS_USER}`,
    createdAt: now,
    photoUrl: null,
    updatedAt: now,
    pseudo: generateUsername(),
  })

  await refs[TABLES.USERS].doc(uid).set(userDoc)
}

export const waitForAnonymousAuth = async (page: Page) => {
  await page.goto("/")

  await expect(page.getByTestId("create-lobby-button-demo")).toBeVisible()

  const anonymousUid = await getAnonymousUid(page)
  expect(anonymousUid).toBeTruthy()

  return anonymousUid || ""
}
