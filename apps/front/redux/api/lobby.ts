import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { DEFAULT_HAS_SPECIAL_ROUNDS, DEFAULT_LIVES, DEFAULT_NUMBERS_ROUNDS, DEFAULT_TIME_PER_ROUND, isEqual, LOBBY_STATUS, MAX_PLAYERS, NUMBER_OF_ROUNDS_PER_STAGE, ROUND_POINTS, TABLES } from "@repo/common"
import {
  type CreateLobbyInput,
  createLobbyInputSchema,
  currentRoundDataSchema,
  type LobbyDoc,
  lobbyDocSchema,
  type LobbyDocWithId,
  lobbyDocWithIdSchema,
  type Player,
  type PlayerAnswer,
  playerAnswerSchema,
  roundAnswerDocSchema,
  type RoundAnswerDocWithId,
  roundAnswerDocWithIdSchema,
  type UpdateLobbyInput,
  updateLobbyInputSchema
} from "@repo/schemas"
import {
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore"
import { toast } from "sonner"
import z from "zod"
import { auth } from "@/constants/db"
import { getLobbyRef, getRoundAnswerRef, TABLE_REFS } from "@/constants/db-refs"
import { API_ENDPOINTS } from "@/constants/mapping"
import { seedApi } from "@/redux/api/seed"
import { type SessionUser } from "@/schemas/session"
import { type GlobalError, globalErrorHandler } from "@/utils/error"
import { createPlayerFromSessionUser, generateRandomCode } from "@/utils/player"

export const lobbyApi = createApi({
  reducerPath: "lobbyApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Lobby", "LobbyByCode"],
  endpoints: (builder) => ({
    getLobbyById: builder.query<LobbyDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getLobbyRef(id))

          if (!docSnap.exists()) {
            throw new Error("Lobby not found")
          }

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching lobby by ID:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Lobby", id }],
    }),
    getLobbyByCode: builder.query<LobbyDocWithId | null, { code: string }>({
      queryFn: async ({ code }) => {
        try {
          const q = query(
            TABLE_REFS[TABLES.LOBBIES],
            where("code", "==", code.toUpperCase()),
          )

          const snapshot = await getDocs(q)

          if (snapshot.empty) {
            return { data: null }
          }

          const docSnap = snapshot.docs[0]

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching lobby by code:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { code }) => [
        { type: "LobbyByCode", id: code },
      ],
    }),
    subscribeLobby: builder.query<LobbyDocWithId | null, { id: string }>({
      queryFn: async ({ id }, { dispatch }) => {
        try {
          const docSnap = await dispatch(lobbyApi.endpoints.getLobbyById.initiate({ id })).unwrap()

          const { data, error } = lobbyDocWithIdSchema.safeParse(docSnap)

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching lobby:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      onCacheEntryAdded: async (
        { id },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const lobbyRef = getLobbyRef(id)

          unsubscribe = onSnapshot(
            lobbyRef,
            (snapshot) => {
              if (!snapshot.exists()) {
                updateCachedData(() => null)

                return
              }

              const newData = {
                id: snapshot.id,
                ...snapshot.data(),
              }

              const { data, error } = lobbyDocWithIdSchema.safeParse(newData)

              if (error) {
                console.error("Error parsing lobby data:", error)

                return
              }

              updateCachedData((draft) => {
                if (isEqual(draft, data)) return draft

                return data
              })
            },
            (error) => {
              console.error("Error in lobby snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up lobby listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { id }) => [{ type: "Lobby", id }],
    }),
    createLobby: builder.mutation<LobbyDocWithId, CreateLobbyInput>({
      queryFn: async (input) => {
        try {
          const now = Timestamp.now()
          const { data: validatedInput, error: validationError } =
            createLobbyInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const lobbyData = lobbyDocSchema.parse({
            ...validatedInput,
            createdAt: now,
            updatedAt: now,
          })

          const docRef = await addDoc(TABLE_REFS[TABLES.LOBBIES], lobbyData)

          const docSnap = await getDoc(docRef)

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating lobby:", error)
          toast.error("Error creating lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: [{ type: "Lobby" }],
    }),
    updateLobby: builder.mutation<
      LobbyDocWithId,
      { id: string, data: UpdateLobbyInput }
    >({
      queryFn: async ({ id, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            updateLobbyInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const lobbyRef = getLobbyRef(id)

          await updateDoc(lobbyRef, {
            ...validatedInput,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(lobbyRef)

          if (!docSnap.exists()) {
            throw new Error("Lobby not found")
          }

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating lobby:", error)
          toast.error("Error updating lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Lobby", id }],
    }),
    createAndJoinLobby: builder.mutation<
      LobbyDocWithId,
      { user: SessionUser }
    >({
      queryFn: async (
        { user },
        { dispatch },
      ) => {
        try {
          const code = generateRandomCode()

          const player = createPlayerFromSessionUser(user)

          const createdLobby = await dispatch(
            lobbyApi.endpoints.createLobby.initiate({
              code,
              hostId: player.uid,
              status: LOBBY_STATUS.WAITING,
              players: [],
              maximumPossiblePoints: 0,
              config: {
                hasSpecialRounds: DEFAULT_HAS_SPECIAL_ROUNDS,
                playersLives: DEFAULT_LIVES,
                maxPlayers: MAX_PLAYERS,
                roundDuration: DEFAULT_TIME_PER_ROUND,
                numberOfRounds: DEFAULT_NUMBERS_ROUNDS,
              },
            }),
          ).unwrap()

          const joinedLobby: LobbyDocWithId = await dispatch(
            lobbyApi.endpoints.joinLobby.initiate({
              lobbyId: createdLobby.id,
              player,
            }),
          ).unwrap()

          dispatch(
            lobbyApi.endpoints.subscribeLobby.initiate({ id: createdLobby.id }),
          )

          return { data: joinedLobby }
        } catch (error) {
          console.error("Error creating and joining lobby:", error)
          toast.error("Error creating lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
    }),
    joinLobby: builder.mutation<
      LobbyDocWithId,
      { lobbyId: string, player: Player }
    >({
      queryFn: async ({ lobbyId, player }) => {
        try {
          const lobbyRef = getLobbyRef(lobbyId)
          const docSnap = await getDoc(lobbyRef)

          if (!docSnap.exists()) {
            throw new Error("Lobby not found")
          }

          const currentData = docSnap.data()
          const currentPlayers = currentData?.players || []

          // Check if player already in lobby
          const alreadyJoined = currentPlayers.some(
            (p: Player) => p.uid === player.uid,
          )

          if (alreadyJoined) {
            const { data, error } = lobbyDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...currentData,
            })

            if (error) throw new Error(error.message || "Data parsing error")

            return { data }
          }

          // Add player to lobby
          const updatedPlayers = [...currentPlayers, player]

          await updateDoc(lobbyRef, {
            players: updatedPlayers,
            updatedAt: Timestamp.now(),
          })

          const updatedDocSnap = await getDoc(lobbyRef)

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: updatedDocSnap.id,
            ...updatedDocSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error joining lobby:", error)
          toast.error("Error joining lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [
        { type: "Lobby", id: lobbyId },
      ],
    }),
    leaveLobby: builder.mutation<
      LobbyDocWithId,
      { lobbyId: string, playerId: string }
    >({
      queryFn: async ({ lobbyId, playerId }) => {
        try {
          const lobbyRef = getLobbyRef(lobbyId)
          const docSnap = await getDoc(lobbyRef)

          if (!docSnap.exists()) {
            throw new Error("Lobby not found")
          }

          const currentData = docSnap.data()
          const currentPlayers = currentData?.players || []

          // Remove player from lobby
          const updatedPlayers = currentPlayers.filter(
            (p: Player) => p.uid !== playerId,
          )

          await updateDoc(lobbyRef, {
            players: updatedPlayers,
            updatedAt: Timestamp.now(),
          })

          const updatedDocSnap = await getDoc(lobbyRef)

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: updatedDocSnap.id,
            ...updatedDocSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error leaving lobby:", error)
          toast.error("Error leaving lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [
        { type: "Lobby", id: lobbyId },
      ],
    }),
    excludePlayer: builder.mutation <null, { lobbyId: string, playerId: string }>({
      queryFn: async ({ lobbyId, playerId }, { dispatch }) => {
        try {
          const docSnap = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!docSnap) {
            throw new Error("Lobby not found")
          }

          const currentPlayers = docSnap.players || []

          // Remove player from lobby
          const updatedPlayers = currentPlayers.filter(
            (p: Player) => p.uid !== playerId,
          )

          await updateDoc(getLobbyRef(lobbyId), {
            players: updatedPlayers,
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          console.error("Error excluding player from lobby:", error)
          toast.error("Error excluding player from lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [{ type: "Lobby", id: lobbyId }],
    }),
    updatePlayerReady: builder.mutation<
      LobbyDocWithId,
      { lobbyId: string, playerId: string, isReady: boolean }
    >({
      queryFn: async ({ lobbyId, playerId, isReady }, { dispatch }) => {
        try {
          const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!lobby) {
            throw new Error("Lobby not found")
          }

          const currentData = lobby
          const currentPlayers = currentData?.players || []

          // Update player ready status
          const updatedPlayers = currentPlayers.map((p: Player) =>
            p.uid === playerId ? { ...p, isReady } : p,
          )

          const lobbyRef = getLobbyRef(lobbyId)

          await updateDoc(lobbyRef, {
            players: updatedPlayers,
            updatedAt: Timestamp.now(),
          })

          const updatedDocSnap = await getDoc(lobbyRef)

          const { data, error } = lobbyDocWithIdSchema.safeParse({
            id: updatedDocSnap.id,
            ...updatedDocSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating player ready status:", error)
          toast.error("Error updating ready status")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [
        { type: "Lobby", id: lobbyId },
      ],
    }),
    updatePlayerScore: builder.mutation<null, { lobbyId: string, playerId: string, newPoints: number }>(
      {
        queryFn: async ({ lobbyId, playerId, newPoints }, { dispatch }) => {
          try {
            const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

            if (!lobby) {
              throw new Error("Lobby not found")
            }

            const currentData = lobby
            const currentPlayers = currentData?.players || []

            // Update player ready status
            const updatedPlayers = currentPlayers.map((p: Player) =>
              p.uid === playerId ? { ...p, score: p.score + newPoints } : p,
            )

            const lobbyRef = getLobbyRef(lobbyId)

            await updateDoc(lobbyRef, {
              players: updatedPlayers,
              updatedAt: Timestamp.now(),
            })

            return { data: null }
          } catch (error) {
            console.error("Error updating player ready status:", error)
            toast.error("Error updating ready status")

            return {
              error: globalErrorHandler(error),
            }
          }
        }
      }
    ),
    incrementPlayerLivesUsed: builder.mutation<null, { lobbyId: string, playerId: string, roundIndex: number }>({
      queryFn: async ({ lobbyId, playerId, roundIndex }) => {
        try {
          const roundAnswerRef = getRoundAnswerRef(lobbyId, String(roundIndex))
          const roundAnswerSnap = await getDoc(roundAnswerRef)

          if (!roundAnswerSnap.exists()) {
            throw new Error("Round answer not found")
          }

          const currentAnswers: PlayerAnswer[] = roundAnswerSnap.data()?.answers || []

          const updatedAnswers = currentAnswers.map((a) =>
            a.uid === playerId ? playerAnswerSchema.parse({ ...a, livesUsed: (a.livesUsed || 0) + 1 }) : a
          )

          await updateDoc(roundAnswerRef, {
            answers: updatedAnswers,
          })

          return { data: null }
        } catch (error) {
          console.error("Error incrementing lives used:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
    }),
    updateLobbyConfig: builder.mutation<
      null,
      { lobbyId: string, config: Partial<LobbyDoc["config"]> }
    >({
      queryFn: async ({ lobbyId, config }) => {
        try {
          const lobbyRef = getLobbyRef(lobbyId)
          const docSnap = await getDoc(lobbyRef)

          if (!docSnap.exists()) {
            throw new Error("Lobby not found")
          }

          const currentData = docSnap.data()

          const updatedConfig = {
            ...currentData?.config,
            ...config,
          }

          const { data: validatedConfig, error: validationError } =
            lobbyDocSchema.shape.config.safeParse(updatedConfig)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          await updateDoc(lobbyRef, {
            config: validatedConfig,
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          console.error("Error updating lobby config:", error)
          toast.error("Error updating lobby config")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [{ type: "Lobby", id: lobbyId }],
    }),
    createSeedAndUpdateLobby: builder.mutation<{ seedId: string }, { lobbyId: string }>({
      queryFn: async ({ lobbyId }, { dispatch }) => {
        try {
          const token = await auth.currentUser?.getIdToken()
          const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!lobby) {
            throw new Error("Lobby not found")
          }

          const res = await fetch(API_ENDPOINTS.CREATE_SEED, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              numberOfRounds: lobby.config.numberOfRounds,
              hasSpecialRounds: lobby.config.hasSpecialRounds
            }),
          })

          if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`Failed to create seed: ${errorText}`)
          }

          const data = await res.json()
          const parsed = z.object({ seedId: z.string() }).safeParse(data)

          if (!parsed.success) {
            throw new Error("Invalid response from seed creation endpoint")
          }
          const seedId = parsed.data.seedId

          await updateDoc(getLobbyRef(lobbyId), {
            seedId,
            updatedAt: Timestamp.now(),
          })

          return { data: { seedId } }
        } catch (error) {
          console.error("Error creating seed and updating lobby:", error)
          toast.error("Error creating seed")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [{ type: "Lobby", id: lobbyId }],
    }),
    populateLobbyRounds: builder.mutation<null, { lobbyId: string, seedId: string, players: Player[] }>(
      {
        queryFn: async ({ lobbyId, seedId, players }, { dispatch }) => {
          try {
            const docSnap = await dispatch(seedApi.endpoints.getSeedById.initiate({ id: seedId })).unwrap()

            if (!docSnap) throw new Error("Seed not found, cannot populate lobby rounds")

            const now = Timestamp.now()

            const emptyAnswers = players.map((player) =>
              playerAnswerSchema.parse({
                uid: player.uid,
                playerName: player.name,
              })
            )

            const maximumPossiblePoints = docSnap.rounds.reduce((acc, round, i) => {
              const index = i + 1
              const stage = Math.ceil(index / NUMBER_OF_ROUNDS_PER_STAGE)

              const pointsGame = ROUND_POINTS.GAME_GUESS * (round.isSpecial ? 2 : 1)
              const pointsDistance = round.isSpecial ? 0 : (ROUND_POINTS.DISTANCE + ROUND_POINTS.DISTANCE_ADDITION * stage)

              return acc + pointsGame + pointsDistance
            }, 0)

            await updateDoc(getLobbyRef(lobbyId), {
              maximumPossiblePoints,
              updatedAt: now,
            })

            await Promise.all(
              docSnap.rounds.map((round, i) => {
                const index = i + 1
                const stage = Math.ceil(index / NUMBER_OF_ROUNDS_PER_STAGE)
                const pointsGame = ROUND_POINTS.GAME_GUESS * (round.isSpecial ? 2 : 1)
                const pointsDistance = round.isSpecial ? 0 : (ROUND_POINTS.DISTANCE + ROUND_POINTS.DISTANCE_ADDITION * stage)

                const roundAnswerDoc = roundAnswerDocSchema.parse({
                  ...round,
                  stage,
                  roundIndex: index,
                  pointsGame,
                  pointsDistance,
                  answers: emptyAnswers,
                  isComplete: false,
                  createdAt: now,
                })

                return setDoc(getRoundAnswerRef(lobbyId, String(index)), roundAnswerDoc)
              })
            )

            return { data: null }
          } catch (error) {
            console.error("Error populating lobby rounds:", error)
            toast.error("Error populating lobby rounds")

            return {
              error: globalErrorHandler(error),
            }
          }
        }
      }
    ),
    startLobby: builder.mutation<null, { lobbyId: string }>({
      queryFn: async ({ lobbyId }, { dispatch }) => {
        try {
          const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!lobby) {
            throw new Error("Lobby not found")
          }

          if (lobby.status !== LOBBY_STATUS.WAITING)
            throw new Error("Status need to be 'waiting' to start the game")

          await updateDoc(getLobbyRef(lobbyId), {
            status: LOBBY_STATUS.STARTING,
            updatedAt: Timestamp.now(),
          })

          let seedId = lobby.seedId

          if (!seedId) {
            const newSeed = await dispatch(lobbyApi.endpoints.createSeedAndUpdateLobby.initiate({ lobbyId })).unwrap()

            seedId = newSeed.seedId
          }

          await dispatch(lobbyApi.endpoints.populateLobbyRounds.initiate({ lobbyId, seedId, players: lobby.players }))

          await updateDoc(getLobbyRef(lobbyId), {
            seedId,
            currentRound: 0,
            status: LOBBY_STATUS.PLAYING,
            updatedAt: Timestamp.now(),
          })

          await dispatch(lobbyApi.endpoints.updateNextRound.initiate({ lobbyId }))

          return { data: null }
        } catch (error) {
          console.error("Error starting lobby:", error)
          toast.error("Error starting lobby")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [{ type: "Lobby", id: lobbyId }],
    }),
    submitRoundAnswer: builder.mutation<null, { lobbyId: string, roundIndex: number, uid: string, answer: Partial<PlayerAnswer> }>({
      queryFn: async ({ lobbyId, roundIndex, uid, answer }) => {
        try {
          const roundAnswerRef = getRoundAnswerRef(lobbyId, String(roundIndex))
          const roundAnswerSnap = await getDoc(roundAnswerRef)

          if (!roundAnswerSnap.exists()) {
            throw new Error("Round answer not found")
          }

          const currentAnswers: PlayerAnswer[] = roundAnswerSnap.data()?.answers || []

          const updatedAnswers = currentAnswers.map((a) =>
            a.uid === uid ? playerAnswerSchema.parse({ ...a, ...answer }) : a
          )

          await updateDoc(roundAnswerRef, {
            answers: updatedAnswers,
          })

          return { data: null }
        } catch (error) {
          console.error("Error submitting round answer:", error)
          toast.error("Error submitting answer")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
    }),
    listenRoundAnswer: builder.query<RoundAnswerDocWithId | null, { lobbyId: string, roundIndex: number }>({
      queryFn: async ({ lobbyId, roundIndex }) => {
        try {
          const roundAnswerSnap = await getDoc(getRoundAnswerRef(lobbyId, String(roundIndex)))

          if (!roundAnswerSnap.exists()) {
            return { data: null }
          }

          const { data, error } = roundAnswerDocWithIdSchema.safeParse({
            id: roundAnswerSnap.id,
            ...roundAnswerSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching round answer:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      onCacheEntryAdded: async (
        { lobbyId, roundIndex },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const roundAnswerRef = getRoundAnswerRef(lobbyId, String(roundIndex))

          unsubscribe = onSnapshot(
            roundAnswerRef,
            (snapshot) => {
              if (!snapshot.exists()) {
                updateCachedData(() => null)

                return
              }

              const newData = {
                id: snapshot.id,
                ...snapshot.data(),
              }

              const { data, error } = roundAnswerDocWithIdSchema.safeParse(newData)

              if (error) {
                console.error("Error parsing round answer data:", error)

                return
              }

              updateCachedData((draft) => {
                if (isEqual(draft, data)) return draft

                return data
              })
            },
            (error) => {
              console.error("Error in round answer snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up round answer listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),
    updateNextRound: builder.mutation<null, { lobbyId: string }>({
      queryFn: async ({ lobbyId }, { dispatch }) => {
        try {
          const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!lobby) throw new Error("Lobby not found")

          const nextRound = lobby.currentRound + 1

          if (nextRound > lobby.config.numberOfRounds) {
            console.info("All rounds completed, no more rounds to update")

            dispatch(lobbyApi.endpoints.updateLobby.initiate({
              id: lobbyId,
              data: {
                status: LOBBY_STATUS.FINISHED,
              },
            }))

            return { data: null }
          }

          const roundAnswerSnap = await getDoc(getRoundAnswerRef(lobbyId, String(nextRound)))

          if (!roundAnswerSnap.exists()) {
            throw new Error(`Round answer ${nextRound} not found`)
          }

          const roundAnswerData = roundAnswerSnap.data()

          const { data: currentRoundData, error: parseError } = currentRoundDataSchema.safeParse(roundAnswerData)

          if (parseError) throw new Error(parseError.message || "Data parsing error")

          await updateDoc(getLobbyRef(lobbyId), {
            currentRound: nextRound,
            currentRoundData,
            roundStartedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          console.error("Error updating next round:", error)
          toast.error("Error updating next round")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { lobbyId }) => [{ type: "Lobby", id: lobbyId }],
    }),
    selectOptionIndex: builder.mutation<null, { lobbyId: string, playerId: string, roundIndex: number, selectedOptionIndex: number }>({
      queryFn: async ({ lobbyId, roundIndex, playerId, selectedOptionIndex }, { dispatch }) => {
        try {
          const roundAnswer = await dispatch(lobbyApi.endpoints.listenRoundAnswer.initiate({ lobbyId, roundIndex })).unwrap()

          const currentAnswers: PlayerAnswer[] = roundAnswer?.answers || []

          const updatedAnswers = currentAnswers.map((answer) =>
            answer.uid === playerId ? playerAnswerSchema.parse({ ...answer, selectedOptionIndex }) : answer
          )

          const roundAnswerRef = getRoundAnswerRef(lobbyId, String(roundIndex))

          await updateDoc(roundAnswerRef, {
            answers: updatedAnswers,
          })

          return { data: null }
        } catch (error) {
          console.error("Error selecting option index:", error)
          toast.error("Error submitting answer")

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    }),
    getNumberGameFoundByPlayer: builder.query<{ numberGameFound: number }, { lobbyId: string, playerId: string }>({
      queryFn: async ({ lobbyId, playerId }, { dispatch }) => {
        try {
          const lobby = await dispatch(lobbyApi.endpoints.subscribeLobby.initiate({ id: lobbyId })).unwrap()

          if (!lobby) throw new Error("Lobby not found")

          let numberGameFound = 0

          for (let i = 1; i <= lobby.config.numberOfRounds; i++) {
            const roundAnswer = await dispatch(lobbyApi.endpoints.listenRoundAnswer.initiate({ lobbyId, roundIndex: i })).unwrap()

            if (!roundAnswer) continue

            const playerAnswer = roundAnswer.answers.find((a) => a.uid === playerId)

            if (playerAnswer?.isCorrect) {
              numberGameFound++
            }
          }

          return { data: { numberGameFound } }
        } catch (error) {
          console.error("Error getting number of games found by player:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
    }),
  })
})

export const {
  useGetLobbyByIdQuery,
  useGetLobbyByCodeQuery,
  useSubscribeLobbyQuery,
  useCreateLobbyMutation,
  useUpdateLobbyMutation,
  useJoinLobbyMutation,
  useLeaveLobbyMutation,
  useUpdatePlayerReadyMutation,
  useCreateAndJoinLobbyMutation,
  useExcludePlayerMutation,
  useUpdateLobbyConfigMutation,
  useSubmitRoundAnswerMutation,
  useListenRoundAnswerQuery,
  useUpdateNextRoundMutation,
  useStartLobbyMutation,
  useUpdatePlayerScoreMutation,
  useIncrementPlayerLivesUsedMutation,
  useSelectOptionIndexMutation,
  useGetNumberGameFoundByPlayerQuery
} = lobbyApi
