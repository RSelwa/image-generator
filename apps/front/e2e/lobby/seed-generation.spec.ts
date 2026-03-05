import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { collectionGroupRefs, refs, subRefs } from "@repo/providers/db-refs"
import { type Round } from "@repo/schemas"
import { lobbyFactory, roundFactory } from "@repo/testing/factory"
import {
  createFinishedLobbyWithSeed,
  createFirestoreLobbyDoc,
  createPlayerFromUserDoc,
  hideDriverTutorial,
  loginViaUI,
  setupUser,
  startSoloLobbyViaUI,
} from "../helpers/lobby"

test.describe("Test seed generation", () => {
  test.describe("When clicking on play in lobby", () => {
    test("Should create seed based on config of the lobby", async ({ page }) => {
      const host = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)

      const lobby = lobbyFactory({
        hostId: host.id,
        config: {
          numberOfRounds: 6,
          hasSpecialRounds: false,
          maxPlayers: 8,
          playersLives: 3,
          roundDuration: 30,
        },
        players: [playerHost,
        ]
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await hideDriverTutorial(page)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      await startSoloLobbyViaUI(page)

      await page.waitForTimeout(5000)

      const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobby.id).get()

      expect(lobbyDoc?.data()?.seedId).toBeTruthy()

      const seedId = lobbyDoc?.data()?.seedId
      const seedDoc = await refs[TABLES.SEEDS].doc(seedId || "").get()

      expect(seedDoc).toBeTruthy()

      const rounds = seedDoc?.data()?.rounds
      expect(rounds).toBeTruthy()
      expect(rounds?.length).toBe(6)
    })

    test("should have populated roundAnswers correctly", async ({ page }) => {
      const host = await setupUser()

      const playerHost = createPlayerFromUserDoc(host)

      const lobby = lobbyFactory({
        hostId: host.id,
        config: {
          numberOfRounds: 6,
          hasSpecialRounds: false,
          maxPlayers: 8,
          playersLives: 3,
          roundDuration: 30,
        },
        players: [playerHost,
        ]
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await hideDriverTutorial(page)
      await page.goto(`/lobby/${lobby.id}`)

      await startSoloLobbyViaUI(page)

      await page.waitForTimeout(7000)

      const roundAnswersCollection = await subRefs[TABLES.ROUND_ANSWERS](lobby.id).get()
      const lobbyUpdated = await refs[TABLES.LOBBIES].doc(lobby.id).get()

      expect(lobbyUpdated?.data()?.maximumPossiblePoints).toBe(1500)

      expect(roundAnswersCollection).toBeTruthy()

      const documents = roundAnswersCollection?.docs || []
      expect(documents.length).toBe(6)

      for (const doc of documents) {
        const data = doc.data()

        expect(data.roundIndex).toBeTruthy()
        expect(data.answers).toBeTruthy()
        expect(data.isComplete).toBe(false)
      }
    })
  })

  test.describe("When user has recently played games", () => {
    const getAllAvailableGameIds = async () => {
      const [sphericals, flats] = await Promise.all([
        collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", "ready").where("mapId", ">", "").get(),
        collectionGroupRefs[TABLES.FLAT].where("status", "==", "ready").where("mapId", ">", "").get(),
      ])

      const gameIds = new Set<string>()

      for (const doc of sphericals.docs) {
        const data = doc.data()
        if (data.gameId) gameIds.add(data.gameId)
      }

      for (const doc of flats.docs) {
        const data = doc.data()
        if (data.gameId) gameIds.add(data.gameId)
      }

      return [...gameIds]
    }

    test("should avoid games from user's recent lobbies when generating seed", async ({ page }) => {
      const host = await setupUser()
      const playerHost = createPlayerFromUserDoc(host)

      // Get all available game IDs, then use only a small subset as "already played"
      const allGameIds = await getAllAvailableGameIds()

      // Use only 6 game IDs as recently played — pool has ~48 games so there's plenty left
      const recentlyPlayedGameIds = allGameIds.slice(0, 6)
      const rounds: Round[] = recentlyPlayedGameIds.map((gameId) => roundFactory({ gameId }))

      await createFinishedLobbyWithSeed({ userId: host.id, rounds })

      // Create a new lobby and start it
      const lobby = lobbyFactory({
        hostId: host.id,
        config: {
          numberOfRounds: 6,
          hasSpecialRounds: false,
          maxPlayers: 8,
          playersLives: 3,
          roundDuration: 30,
        },
        players: [playerHost],
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await hideDriverTutorial(page)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      await startSoloLobbyViaUI(page)

      await page.waitForTimeout(5000)

      // Verify seed was created
      const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobby.id).get()
      expect(lobbyDoc?.data()?.seedId).toBeTruthy()

      const seedId = lobbyDoc?.data()?.seedId
      const seedDoc = await refs[TABLES.SEEDS].doc(seedId || "").get()

      const newRounds = seedDoc?.data()?.rounds
      expect(newRounds).toBeTruthy()
      expect(newRounds?.length).toBe(6)

      // Verify NONE of the recently played gameIds appear in the new seed
      const newSeedGameIds = newRounds?.map((r) => r.gameId).filter(Boolean) || []

      for (const gameId of newSeedGameIds) {
        expect(recentlyPlayedGameIds).not.toContain(gameId)
      }
    })

    test("should fallback to full pool when all games have been played recently", async ({ page }) => {
      const host = await setupUser()
      const playerHost = createPlayerFromUserDoc(host)

      // Get all available game IDs from the test database
      const allGameIds = await getAllAvailableGameIds()

      // Split all game IDs across 3 finished lobbies to cover the entire pool
      const chunkSize = Math.ceil(allGameIds.length / 3)
      const chunks = [
        allGameIds.slice(0, chunkSize),
        allGameIds.slice(chunkSize, chunkSize * 2),
        allGameIds.slice(chunkSize * 2),
      ]

      // Create 3 finished lobbies covering ALL available games
      for (const chunk of chunks) {
        const rounds: Round[] = chunk.map((gameId) => roundFactory({ gameId }))

        await createFinishedLobbyWithSeed({ userId: host.id, rounds })
      }

      // Now create a new lobby and start it — seed generation should fallback gracefully
      const lobby = lobbyFactory({
        hostId: host.id,
        config: {
          numberOfRounds: 6,
          hasSpecialRounds: false,
          maxPlayers: 8,
          playersLives: 3,
          roundDuration: 30,
        },
        players: [playerHost],
      })

      await createFirestoreLobbyDoc(lobby)

      await loginViaUI(page, host.email)
      await hideDriverTutorial(page)
      await page.goto(`/lobby/${lobby.id}`)

      await expect(page.getByText("Players in lobby:")).toBeVisible()

      await startSoloLobbyViaUI(page)

      await page.waitForTimeout(5000)

      // Verify seed was still created successfully despite all games being recently played
      const lobbyDoc = await refs[TABLES.LOBBIES].doc(lobby.id).get()
      expect(lobbyDoc?.data()?.seedId).toBeTruthy()

      const seedId = lobbyDoc?.data()?.seedId
      const seedDoc = await refs[TABLES.SEEDS].doc(seedId || "").get()

      const rounds = seedDoc?.data()?.rounds
      expect(rounds).toBeTruthy()
      expect(rounds?.length).toBe(6)

      // Verify no duplicate gameIds within the seed
      const seedGameIds = rounds?.map((r) => r.gameId).filter(Boolean) || []
      const uniqueSeedGameIds = new Set(seedGameIds)
      expect(uniqueSeedGameIds.size).toBe(seedGameIds.length)
    })
  })
})
