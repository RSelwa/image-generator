import { expect, test } from "@playwright/test"
import { TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { lobbyFactory } from "@repo/testing/factory"
import {
  createFirestoreLobbyDoc,
  createPlayerFromUserDoc,
  getReadyViaUI,
  loginViaUI,
  setupUser,
  startLobbyViaUI,
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
})
