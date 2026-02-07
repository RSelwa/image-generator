import { createSelector } from "@reduxjs/toolkit"
import { auth } from "@/constants/db"
import { lobbyApi } from "@/redux/api/lobby"
import { type RootState } from "@/redux/store"

const selectUserId = (state: RootState) => state.session.user?.id

// Factory: creates a lobby result selector for a given lobbyId
const selectLobbyResult = (lobbyId: string) =>
  lobbyApi.endpoints.subscribeLobby.select({ id: lobbyId })

// Lobby data
export const selectLobby = (lobbyId: string) =>
  createSelector(selectLobbyResult(lobbyId), (result) => result.data)

// Current user's player in the lobby
export const selectPlayerMyself = (lobbyId: string) =>
  createSelector(
    selectLobby(lobbyId),
    selectUserId,
    (lobby) => {
      const userId = auth.currentUser?.uid

      return lobby?.players.find((p) => p.uid === userId) || null
    },
  )

// Is the current user the host
export const selectIsLobbyHost = (lobbyId: string) =>
  createSelector(
    selectLobby(lobbyId),
    selectUserId,
    (lobby, userId) => lobby?.hostId === userId,
  )

// Lobby config
export const selectLobbyConfig = (lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.config)

// Current round data
export const selectCurrentRoundData = (lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.currentRoundData)

// Lobby status
export const selectLobbyStatus = (lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.status)

// Lobby players list
export const selectLobbyPlayers = (lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.players || [])

// Current player's round answer
const selectRoundAnswerResult = (lobbyId: string, roundIndex: number) =>
  lobbyApi.endpoints.listenRoundAnswer.select({ lobbyId, roundIndex })

export const selectCurrentPlayerRoundAnswer = (lobbyId: string, roundIndex: number) =>
  createSelector(
    selectRoundAnswerResult(lobbyId, roundIndex),
    (result) => {
      const uid = auth.currentUser?.uid

      return result.data?.answers?.find((a) => a.uid === uid) || null
    },
  )

// Are all players ready for next round
export const selectAllPlayersReady = (lobbyId: string, roundIndex: number) =>
  createSelector(
    selectRoundAnswerResult(lobbyId, roundIndex),
    selectLobbyPlayers(lobbyId),
    (result, players) => {
      const answers = result.data?.answers || []
      if (answers.length === 0 || players.length === 0) return false

      return players.every((p) => answers.some((a) => a.uid === p.uid && a.isReadyForNextRound))
    },
  )

// Current player's remaining lives (null if lives mode is disabled)
export const selectMyLivesRemaining = (lobbyId: string) =>
  createSelector(
    selectLobbyConfig(lobbyId),
    selectPlayerMyself(lobbyId),
    (config, player) => {
      if (!config?.playersLives) return 0

      return config.playersLives - (player?.livesUsed || 0)
    },
  )

// Is the current player eliminated
export const selectIsPlayerEliminated = (lobbyId: string) =>
  createSelector(
    selectMyLivesRemaining(lobbyId),
    (livesRemaining) => livesRemaining !== null && livesRemaining <= 0,
  )
