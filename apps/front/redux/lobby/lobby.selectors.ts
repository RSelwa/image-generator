import { createSelector } from "@reduxjs/toolkit"
import { type Player, toRoundEntity } from "@repo/schemas"
import { auth } from "@/constants/db"
import { lobbyApi } from "@/redux/api/lobby"
import { type RootState } from "@/redux/store"

const EMPTY_PLAYERS: Player[] = []

// Selector factories must return the SAME instance for the same arguments.
// Call sites invoke them inline during render, so a fresh createSelector each
// render throws away the memo cache and makes useSyncExternalStore see a new
// snapshot on every read.
const memoizeByArgs = <Args extends (string | number)[], Result>(
  factory: (...args: Args) => Result
) => {
  const cache = new Map<string, Result>()

  return (...args: Args) => {
    const key = args.join("|")
    const cached = cache.get(key)

    if (cached) return cached

    const created = factory(...args)

    cache.set(key, created)

    return created
  }
}

const selectUserId = (state: RootState) => state.session.user?.id

// Factory: creates a lobby result selector for a given lobbyId
const selectLobbyResult = memoizeByArgs((lobbyId: string) =>
  lobbyApi.endpoints.subscribeLobby.select({ id: lobbyId }))

// Lobby data
export const selectLobby = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobbyResult(lobbyId), (result) => result.data))

// Current user's player in the lobby
export const selectPlayerMyself = memoizeByArgs((lobbyId: string) =>
  createSelector(
    selectLobby(lobbyId),
    selectUserId,
    (lobby) => {
      const userId = auth.currentUser?.uid

      return lobby?.players.find((p) => p.uid === userId) || null
    },
  ))

// Is the current user the host
export const selectIsLobbyHost = memoizeByArgs((lobbyId: string) =>
  createSelector(
    selectLobby(lobbyId),
    selectUserId,
    (lobby, userId) => lobby?.hostId === userId,
  ))

// Lobby config
export const selectLobbyConfig = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.config))

// Current round data (raw Firestore shape)
export const selectCurrentRoundData = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.currentRoundData))

// Current round data as a typed RoundEntity
export const selectCurrentRoundEntity = memoizeByArgs((lobbyId: string) =>
  createSelector(selectCurrentRoundData(lobbyId), (roundData) => {
    if (!roundData) return null

    return toRoundEntity(roundData)
  }))

// Current round index
export const selectCurrentRoundIndex = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.currentRound || 0))

// Lobby status
export const selectLobbyStatus = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.status))

// Lobby players list
export const selectLobbyPlayers = memoizeByArgs((lobbyId: string) =>
  createSelector(selectLobby(lobbyId), (lobby) => lobby?.players || EMPTY_PLAYERS))

// Current player's round answer
const selectRoundAnswerResult = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  lobbyApi.endpoints.listenRoundAnswer.select({ lobbyId, roundIndex }))

export const selectCurrentPlayerRoundAnswer = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectRoundAnswerResult(lobbyId, roundIndex),
    (result) => {
      const uid = auth.currentUser?.uid

      return result.data?.answers?.find((a) => a.uid === uid) || null
    },
  ))

// Has the current player selected an option
export const selectHasSelectedOption = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectCurrentPlayerRoundAnswer(lobbyId, roundIndex),
    (answer) => answer?.selectedOptionIndex !== null && answer?.selectedOptionIndex !== undefined,
  ))

// Selected option for the current player
export const selectSelectedOption = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectCurrentPlayerRoundAnswer(lobbyId, roundIndex),
    selectCurrentRoundData(lobbyId),
    (answer, roundData) => {
      const index = answer?.selectedOptionIndex
      if (index === null || index === undefined) return null

      return roundData?.options?.[index] || null
    },
  ))

// Are all players ready for next round
export const selectAllPlayersReady = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectRoundAnswerResult(lobbyId, roundIndex),
    selectLobbyPlayers(lobbyId),
    (result, players) => {
      const answers = result.data?.answers || []
      if (answers.length === 0 || players.length === 0) return false

      return players.every((p) => answers.some((a) => a.uid === p.uid && a.isReadyForNextRound))
    },
  ))

// Current player's remaining lives (0 if lives mode is disabled)
export const selectMyLivesRemaining = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectLobbyConfig(lobbyId),
    selectCurrentPlayerRoundAnswer(lobbyId, roundIndex),
    (config, answer) => {
      if (!config?.playersLives) return 0

      return config.playersLives - (answer?.livesUsed || 0)
    },
  ))

// Is the current player eliminated
export const selectIsPlayerEliminated = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(
    selectMyLivesRemaining(lobbyId, roundIndex),
    selectLobbyConfig(lobbyId),
    (livesRemaining, config) => {
      if (!config?.playersLives) return false

      return livesRemaining !== null && livesRemaining <= 0
    },
  ))

export const selectCurrentRoundGameTitle = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(selectCurrentRoundData(lobbyId), selectSelectedOption(lobbyId, roundIndex), (roundData, selectedOption) => selectedOption?.gameTitle || roundData?.gameTitle || ""))

export const selectCurrentRoundInfos = memoizeByArgs((lobbyId: string, roundIndex: number) =>
  createSelector(selectLobby(lobbyId), selectSelectedOption(lobbyId, roundIndex), (lobby, selectedOption) => lobby?.currentRoundData?.isSpecial ? selectedOption : lobby?.currentRoundData))
