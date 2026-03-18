import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { type Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { type AVATARS_KEYS, type ConstantValues } from "@repo/common"
import { METADATA_DOCS, mockedGameImageURL, mockedSphericalImageURL, RACE_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type MarathonSeedRound } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, marathonSeedFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { SELECTORS } from "@/constants/testing"
import { hideDriverTutorial, loginViaUI, setupUser } from "../helpers/lobby"

const RACE_DURATION = 90

const createGamesAndSeed = async (count: number) => {
  const games = Array.from({ length: count }, () =>
    gameFactory({ image: mockedGameImageURL }))

  await Promise.all(
    games.map((game) => createFirestoreDoc(refs[TABLES.GAMES], game)),
  )

  // Populate the metadata gamesList so the combobox autocomplete works
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

const createRaceDoc = async ({
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
  const raceId = faker.database.mongodbObjectId()

  await refs[TABLES.RACES].doc(raceId).set({
    code: faker.string.alpha({ length: 6 }).toUpperCase(),
    hostId,
    seedId,
    status: RACE_STATUS.PLAYING,
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
    duration: RACE_DURATION,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  return raceId
}

const createRaceRunDoc = async (raceId: string, uid: string) => {
  const now = Timestamp.now() as unknown as ClientTimestamp

  await subRefs[TABLES.RACE_RUNS](raceId).doc(uid).set({
    uid,
    score: 0,
    currentRoundIndex: 0,
    answers: [],
    startedAt: now,
    finishedAt: null,
  })
}

const typeAndSelectGame = async (page: Page, gameTitle: string) => {
  const input = page.getByTestId(SELECTORS.RACE_GUESS_INPUT)
  await expect(input).toBeVisible({ timeout: 10_000 })
  await input.fill(gameTitle)
  await page.getByRole("option", { name: gameTitle }).click()
}

test.describe("Race playing", () => {
  test("should play a race until the end", async ({ page }) => {
    test.setTimeout(120_000)

    const { games, seed } = await createGamesAndSeed(5)

    const user = await setupUser()
    await loginViaUI(page, user.email)
    await hideDriverTutorial(page)

    const raceId = await createRaceDoc({
      hostId: user.id,
      seedId: seed.id,
      playerName: user.pseudo || "Player",
      playerAvatar: user.avatar || "assassin",
    })
    await createRaceRunDoc(raceId, user.id)

    await page.goto(`/en/race/${raceId}`)

    // -- Round 1: correct answer → score should be 100 --
    await typeAndSelectGame(page, games[0].title)
    await expect(page.getByTestId(SELECTORS.RACE_SCORE)).toHaveText("100 pts", { timeout: 10_000 })

    // -- Round 2: wrong answer → score should be 50 (100 - 50) --
    await typeAndSelectGame(page, games[2].title) // wrong game for round index 1
    await expect(page.getByTestId(SELECTORS.RACE_SCORE)).toHaveText("50 pts", { timeout: 10_000 })

    // -- Round 3: correct answer → score should be 150 --
    await typeAndSelectGame(page, games[2].title)
    await expect(page.getByTestId(SELECTORS.RACE_SCORE)).toHaveText("150 pts", { timeout: 10_000 })

    // -- Round 4: wrong answer → score should be 100 --
    await typeAndSelectGame(page, games[0].title) // wrong game for round index 3
    await expect(page.getByTestId(SELECTORS.RACE_SCORE)).toHaveText("100 pts", { timeout: 10_000 })

    // -- Round 5: correct answer → score should be 200 --
    await typeAndSelectGame(page, games[4].title)
    await expect(page.getByTestId(SELECTORS.RACE_SCORE)).toHaveText("200 pts", { timeout: 10_000 })

    // -- Wait for the timer to expire and race to finish --
    await expect(page.getByTestId(SELECTORS.RACE_FINISHED)).toBeVisible({ timeout: RACE_DURATION * 1000 })

    // -- Verify the finished screen shows the score and rounds --
    await expect(page.getByTestId(SELECTORS.RACE_FINISHED_SCORE(user.id))).toHaveText("200 pts")
    await expect(page.getByTestId(SELECTORS.RACE_FINISHED_ROUNDS(user.id))).toHaveText("5 rounds")

    // -- Verify Firestore race status is FINISHED --
    const raceDoc = await refs[TABLES.RACES].doc(raceId).get()
    expect(raceDoc.data()?.status).toBe(RACE_STATUS.FINISHED)

    // -- Verify the race run in Firestore --
    const runDoc = await subRefs[TABLES.RACE_RUNS](raceId).doc(user.id).get()
    const runData = runDoc.data()
    expect(runData?.score).toBe(200)
    expect(runData?.answers.length).toBe(5)
    expect(runData?.finishedAt).toBeTruthy()

    // -- Verify bestRaceScore is saved on the user doc --
    const userDoc = await refs[TABLES.USERS].doc(user.id).get()
    expect(userDoc.data()?.bestRaceScore).toBe(200)
  })
})
