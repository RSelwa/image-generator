import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { expect, test } from "@playwright/test"
import { DEFAULT_MAX_DISTANCE_POINTS, DIFFICULTIES, DOCUMENTS_STATUS, mockedSphericalImageURL, ROUND_TYPE, SPECIAL_ROUND_OPTIONS_COUNT, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type Round, roundSchema } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, mapFactory, seedFactory, sphericalFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { SELECTORS } from "@/constants/testing"
import {
  createLobbyViaUI,
  hideDriverTutorial,
  loginViaUI,
  retrieveGamesFromLobby,
  setupUser,
  startSoloLobbyViaUI,
  waitForInputToBeVisible,
  waitToBeLogged,
} from "../helpers/lobby"

const createGameEntry = () => {
  const game = gameFactory()
  const map = mapFactory({ gameId: game.id })
  const sphericalWithMap = sphericalFactory({
    gameId: game.id,
    mapId: map.id,
    status: DOCUMENTS_STATUS.READY,
    mapPosition: { x: 50, y: 50 },
  })
  const sphericalWithThumbnail = sphericalFactory({
    gameId: game.id,
    thumbnail: mockedSphericalImageURL,
    status: DOCUMENTS_STATUS.READY,
  })

  return { game, map, sphericalWithMap, sphericalWithThumbnail }
}

const createGameEntries = async (count: number) => {
  const entries = Array.from({ length: count }, () => createGameEntry())

  await Promise.all(
    entries.map(({ game }) => createFirestoreDoc(refs[TABLES.GAMES], game)),
  )

  await Promise.all(
    entries.flatMap(({ game, map, sphericalWithMap, sphericalWithThumbnail }) => [
      createFirestoreDoc(subRefs[TABLES.MAPS](game.id), map),
      createFirestoreDoc(subRefs[TABLES.SPHERICAL](game.id), sphericalWithMap),
      createFirestoreDoc(subRefs[TABLES.SPHERICAL](game.id), sphericalWithThumbnail),
    ]),
  )

  return entries
}

const buildRoundsFromEntries = (entries: ReturnType<typeof createGameEntry>[]) => {
  const rounds: Round[] = []

  for (let i = 0; i < 6; i++) {
    const entry = entries[i]
    const isSpecial = i === 5

    if (isSpecial) {
      const options = Array.from({ length: SPECIAL_ROUND_OPTIONS_COUNT }, (_, optionIndex) => {
        const optionEntry = entries[6 + optionIndex]

        return {
          type: ROUND_TYPE.SPHERICAL,
          gameId: optionEntry.game.id,
          gameTitle: optionEntry.game.title,
          gameAlternateNames: optionEntry.game.alternateNames,
          gameThumbnailUrl: optionEntry.game.image,
          thumbnailUrl: mockedSphericalImageURL,
          sphericalId: optionEntry.sphericalWithThumbnail.id,
          sphericalImage: optionEntry.sphericalWithThumbnail.image,
        }
      })

      rounds.push(roundSchema.parse({
        isSpecial: true,
        options,
        difficulty: DIFFICULTIES.EASY,
      }))

      continue
    }

    rounds.push(roundSchema.parse({
      isSpecial: false,
      type: ROUND_TYPE.SPHERICAL,
      gameId: entry.game.id,
      gameTitle: entry.game.title,
      gameAlternateNames: entry.game.alternateNames,
      gameThumbnailUrl: entry.game.image,
      sphericalId: entry.sphericalWithMap.id,
      sphericalImageUrl: entry.sphericalWithMap.image,
      mapId: entry.map.id,
      mapPosition: entry.sphericalWithMap.mapPosition,
      mapImage: entry.map.imageUrl,
      mapWidth: entry.map.width,
      mapHeight: entry.map.height,
      maxDistancePoints: entry.map.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
      difficulty: DIFFICULTIES.EASY,
    }))
  }

  return rounds
}

test.describe("lobby featured seed", () => {
  test("should click a featured seed, apply it, and play until the end", async ({ page }) => {
    test.setTimeout(120_000)

    const entries = await createGameEntries(10)
    const rounds = buildRoundsFromEntries(entries)

    const name = faker.lorem.words(3)

    const featuredSeed = seedFactory({
      name,
      rounds,
      featuredAt: Timestamp.now() as unknown as ClientTimestamp,
    })
    await createFirestoreDoc(refs[TABLES.SEEDS], featuredSeed)

    const user = await setupUser()
    await loginViaUI(page, user.email)
    await hideDriverTutorial(page)

    await page.goto("/")
    await waitToBeLogged(page)

    await createLobbyViaUI(page)

    // Click the featured seed
    await page.getByText(name).click()

    // Verify config is updated from the seed
    await expect(page.getByTestId("select-number-rounds-trigger")).toHaveText("6", { timeout: 10000 })
    await expect(page.getByTestId("select-number-rounds-trigger")).toBeDisabled()

    const specialRoundsSwitch = page.getByTestId("special-rounds")
    await expect(specialRoundsSwitch).toBeChecked()
    await expect(specialRoundsSwitch).toBeDisabled()

    await expect(page.getByTestId("seed-input")).toHaveValue(featuredSeed.id)

    // Start the game
    await startSoloLobbyViaUI(page)
    await waitForInputToBeVisible(page)

    const url = page.url()
    const lobbyId = url.split("/lobby/")[1]
    const games = await retrieveGamesFromLobby(lobbyId)

    // Round 1
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[0].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[0].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // Round 2
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[1].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[1].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // Round 3
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[2].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[2].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // Round 4
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[3].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[3].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // Round 5
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toBeVisible()
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[4].game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await page.getByTestId(SELECTORS.MINIMAP).hover()
    await page.waitForTimeout(400)
    await page.getByTestId(SELECTORS.MINIMAP).click({ position: { x: 50, y: 50 } })
    await expect(page.getByTestId(SELECTORS.MAP_MARKER("blue-accent"))).toBeVisible()
    await page.getByTestId(SELECTORS.MAP_SUBMIT).click()

    await expect(page.getByTestId(SELECTORS.GAME_MAP(games[4].game?.title))).toBeVisible()
    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click({ force: true })

    // Round 6 - Special round
    await expect(page.getByTestId(SELECTORS.SPECIAL_ROUND)).toBeVisible()
    await expect(page.getByTestId(SELECTORS.GAME_INPUT_GUESS)).toHaveCount(0)

    await page.getByTestId(SELECTORS.GAME_THUMBNAIL_OPTION("0")).click()

    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).fill(games[5].options?.[0]?.game?.title || "")
    await page.getByTestId(SELECTORS.GAME_INPUT_GUESS).press("Enter")

    await expect(page.getByTestId(SELECTORS.GAME_THUMBNAIL_TITLE(games[5].options?.[0]?.game?.title))).toBeVisible()

    await page.getByTestId(SELECTORS.NEXT_ROUND_BUTTON).click()

    // Verify lobby finished
    await expect(page.getByTestId(SELECTORS.LOBBY_FINISHED)).toBeVisible()
  })
})
