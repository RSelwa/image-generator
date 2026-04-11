import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { type Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { type ConstantValues, type AVATARS_KEYS } from "@repo/common"
import { DEATH_RUN_LIVES, DEATH_RUN_STATUS, METADATA_DOCS, mockedGameImageURL, mockedSphericalImageURL, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type MarathonSeedRound } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, marathonSeedFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { SELECTORS } from "@/constants/testing"
import { hideDriverTutorial, loginViaUI, setupUser } from "../helpers/lobby"

const createGamesAndSeed = async (count: number) => {
  const games = Array.from({ length: count }, () =>
    gameFactory({ image: mockedGameImageURL }))

  await Promise.all(
    games.map((game) => createFirestoreDoc(refs[TABLES.GAMES], game)),
  )

  await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({
    games: games.map((g) => ({ id: g.id, title: g.title })),
  })

  const rounds: MarathonSeedRound[] = games.map((game) => ({
    gameId: game.id,
    sphericalId: null,
    sphericalImageUrl: mockedSphericalImageURL,
    flatId: null,
    flatImageUrl: null,
  }))

  const seed = marathonSeedFactory({
    rounds,
    createdAt: Timestamp.now() as unknown as ClientTimestamp,
    updatedAt: Timestamp.now() as unknown as ClientTimestamp,
  })
  await createFirestoreDoc(refs[TABLES.MARATHON_SEEDS], seed)

  return { games, seed }
}

const createDeathRunDoc = async ({
  hostId,
  seedId,
  playerName,
  playerAvatar,
}: {
  hostId: string
  seedId: string
  playerName: string
  playerAvatar: ConstantValues<typeof AVATARS_KEYS>
}) => {
  const now = Timestamp.now() as unknown as ClientTimestamp
  const deathRunId = faker.database.mongodbObjectId()

  await refs[TABLES.DEATH_RUNS].doc(deathRunId).set({
    code: faker.string.alpha({ length: 6 }).toUpperCase(),
    hostId,
    seedId,
    status: DEATH_RUN_STATUS.PLAYING,
    players: [
      {
        uid: hostId,
        name: playerName,
        avatar: playerAvatar,
        score: 0,
        isHost: true,
        isReady: true,
        joinedAt: now,
      },
    ],
    playersIds: [hostId],
    lives: DEATH_RUN_LIVES,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  return deathRunId
}

const createDeathRunRunDoc = async (deathRunId: string, uid: string) => {
  const now = Timestamp.now() as unknown as ClientTimestamp

  await subRefs[TABLES.DEATH_RUN_RUNS](deathRunId).doc(uid).set({
    uid,
    score: 0,
    currentRoundIndex: 0,
    answers: [],
    livesRemaining: DEATH_RUN_LIVES,
    startedAt: now,
    finishedAt: null,
  })
}

const typeAndSelectGame = async (page: Page, gameTitle: string) => {
  const input = page.getByTestId(SELECTORS.DEATH_RUN_GUESS_INPUT)
  await expect(input).toBeVisible({ timeout: 10_000 })
  await input.fill(gameTitle)
  await page.getByRole("option", { name: gameTitle }).click()
}

test.describe("Death run playing", () => {
  test("should play a death run with correct and wrong answers", async ({ page }) => {
    test.setTimeout(60_000)

    const { games, seed } = await createGamesAndSeed(4)

    const user = await setupUser()
    await loginViaUI(page, user.email)
    await hideDriverTutorial(page)

    const deathRunId = await createDeathRunDoc({
      hostId: user.id,
      seedId: seed.id,
      playerName: user.pseudo || "Player",
      playerAvatar: user.avatar || "assassin",
    })
    await createDeathRunRunDoc(deathRunId, user.id)

    await page.goto(`/en/death-run/${deathRunId}`)

    // -- Round 1: correct answer → score +1 --
    await typeAndSelectGame(page, games[0].title)
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_SCORE)).toHaveText("1 pts", { timeout: 10_000 })

    // -- Round 2: wrong answer → loses a life, score unchanged --
    await typeAndSelectGame(page, games[2].title) // wrong game for round index 1
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_SCORE)).toHaveText("1 pts", { timeout: 10_000 })

    // -- Round 3: correct answer → score +1 --
    await typeAndSelectGame(page, games[2].title)
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_SCORE)).toHaveText("2 pts", { timeout: 10_000 })

    // -- Exhaust remaining lives with wrong answers → game over overlay --
    await typeAndSelectGame(page, games[0].title) // wrong
    await typeAndSelectGame(page, games[0].title) // wrong — last life

    // Game over overlay should appear
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_LIVES)).toBeVisible({ timeout: 10_000 })

    // -- Wait for finished screen --
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_FINISHED)).toBeVisible({ timeout: 15_000 })

    // -- Verify the finished screen shows score and correct count --
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_FINISHED_SCORE(user.id))).toHaveText("2 pts")
    await expect(page.getByTestId(SELECTORS.DEATH_RUN_FINISHED_ROUNDS(user.id))).toHaveText("2 correct")

    // -- Verify Firestore death run status is FINISHED --
    const deathRunDoc = await refs[TABLES.DEATH_RUNS].doc(deathRunId).get()
    expect(deathRunDoc.data()?.status).toBe(DEATH_RUN_STATUS.FINISHED)

    // -- Verify the run in Firestore --
    const runDoc = await subRefs[TABLES.DEATH_RUN_RUNS](deathRunId).doc(user.id).get()
    const runData = runDoc.data()
    expect(runData?.score).toBe(2)
    expect(runData?.livesRemaining).toBe(0)
    expect(runData?.finishedAt).toBeTruthy()

    // -- Verify bestDeathRunScore is saved on the user doc --
    const userDoc = await refs[TABLES.USERS].doc(user.id).get()
    expect(userDoc.data()?.bestDeathRunScore).toBe(2)
  })
})
