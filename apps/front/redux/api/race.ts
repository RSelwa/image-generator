"use client"

import { addDoc, arrayUnion, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, Timestamp, type Unsubscribe, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { RACE_DURATION_SECONDS, RACE_POINTS_PER_ANSWER, RACE_POINTS_PER_WRONG_ANSWER, RACE_SEED_EXTENSION_THRESHOLD, RACE_STATUS, TABLES } from "@repo/common"
import { type RaceDocWithId, raceDocWithIdSchema, type RaceRunDocWithId, raceRunDocWithIdSchema } from "@repo/schemas"
import { getRaceRef, getRaceRunRef, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { cloudFunctionsApi } from "@/redux/api/cloud-functions"
import { type SessionUser } from "@/schemas/session"
import { type GlobalError, globalErrorHandler } from "@/utils/error"
import { createPlayerFromSessionUser, generateRandomCode } from "@/utils/player"

const parseRace = (id: string, data: object): RaceDocWithId | null => {
  const { data: parsed, error } = raceDocWithIdSchema.safeParse({ id, ...data })
  if (error) {
    console.error(`Error parsing race ${id}:`, error)

    return null
  }

  return parsed
}

export const raceApi = createApi({
  reducerPath: "raceApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Race", "RaceRun", "RaceRuns"],
  endpoints: (builder) => ({
    createRace: builder.mutation<RaceDocWithId, { user: SessionUser }>({
      queryFn: async ({ user }) => {
        try {
          const now = Timestamp.now()
          const code = generateRandomCode()
          const player = createPlayerFromSessionUser(user)
          const docRef = await addDoc(TABLE_REFS[TABLES.RACES], {
            code,
            hostId: user.id,
            seedId: null,
            status: RACE_STATUS.WAITING,
            players: [player],
            playersIds: [user.id],
            duration: RACE_DURATION_SECONDS,
            startedAt: null,
            createdAt: now,
            updatedAt: now,
          })
          const docSnap = await getDoc(docRef)
          const race = parseRace(docSnap.id, docSnap.data() as object)
          if (!race) throw new Error("Failed to parse created race")

          return { data: race }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    prepareAndStartRace: builder.mutation<null, { raceId: string }>({
      queryFn: async ({ raceId }, { dispatch }) => {
        try {
          await updateDoc(getRaceRef(raceId), { status: RACE_STATUS.STARTING, updatedAt: Timestamp.now() })

          const now = Timestamp.now()
          const seedDocRef = await addDoc(TABLE_REFS[TABLES.MARATHON_SEEDS], {
            name: `Race ${new Date().toLocaleDateString()}`,
            rounds: [],
            createdAt: now,
            updatedAt: now,
          })

          await dispatch(cloudFunctionsApi.endpoints.populateRaceSeed.initiate({ seedId: seedDocRef.id, playerCurrentIndex: 0 }))

          await updateDoc(getRaceRef(raceId), {
            seedId: seedDocRef.id,
            status: RACE_STATUS.PLAYING,
            startedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    getRaceByCode: builder.query<RaceDocWithId | null, { code: string }>({
      queryFn: async ({ code }) => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.RACES], where("code", "==", code.toUpperCase())),
          )
          if (snapshot.empty) return { data: null }
          const docSnap = snapshot.docs[0]

          return { data: parseRace(docSnap.id, docSnap.data() as object) }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { code }) => [{ type: "Race", id: code }],
    }),

    subscribeRace: builder.query<RaceDocWithId | null, { raceId: string }>({
      queryFn: async ({ raceId }) => {
        try {
          const docSnap = await getDoc(getRaceRef(raceId))
          if (!docSnap.exists()) return { data: null }

          return { data: parseRace(docSnap.id, docSnap.data() as object) }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      onCacheEntryAdded: async ({ raceId }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        let unsubscribe: Unsubscribe | undefined
        try {
          await cacheDataLoaded
          unsubscribe = onSnapshot(getRaceRef(raceId), (snapshot) => {
            if (!snapshot.exists()) {
              updateCachedData(() => null)

              return
            }
            const race = parseRace(snapshot.id, snapshot.data() as object)
            if (race) updateCachedData(() => race)
          })
        } catch { /* cache already gone */ }
        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { raceId }) => [{ type: "Race", id: raceId }],
    }),

    joinRace: builder.mutation<null, { raceId: string, user: SessionUser }>({
      queryFn: async ({ raceId, user }) => {
        try {
          const player = createPlayerFromSessionUser(user)
          await updateDoc(getRaceRef(raceId), {
            players: arrayUnion(player),
            playersIds: arrayUnion(user.id),
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    startRace: builder.mutation<null, { raceId: string }>({
      queryFn: async ({ raceId }) => {
        try {
          await updateDoc(getRaceRef(raceId), {
            status: RACE_STATUS.PLAYING,
            startedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    finishRace: builder.mutation<null, { raceId: string }>({
      queryFn: async ({ raceId }) => {
        try {
          await updateDoc(getRaceRef(raceId), {
            status: RACE_STATUS.FINISHED,
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    createRaceRun: builder.mutation<null, { raceId: string, uid: string }>({
      queryFn: async ({ raceId, uid }) => {
        try {
          const now = Timestamp.now()
          await setDoc(getRaceRunRef(raceId, uid), {
            uid,
            score: 0,
            currentRoundIndex: 0,
            answers: [],
            startedAt: now,
            finishedAt: null,
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    subscribeRaceRun: builder.query<RaceRunDocWithId | null, { raceId: string, uid: string }>({
      queryFn: async ({ raceId, uid }) => {
        try {
          const docSnap = await getDoc(getRaceRunRef(raceId, uid))
          if (!docSnap.exists()) return { data: null }
          const { data, error } = raceRunDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (error) throw new Error(error.message)

          return { data }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      onCacheEntryAdded: async ({ raceId, uid }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        let unsubscribe: Unsubscribe | undefined
        try {
          await cacheDataLoaded
          unsubscribe = onSnapshot(getRaceRunRef(raceId, uid), (snapshot) => {
            if (!snapshot.exists()) {
              updateCachedData(() => null)

              return
            }
            const { data, error } = raceRunDocWithIdSchema.safeParse({ id: snapshot.id, ...snapshot.data() })
            if (!error) updateCachedData(() => data)
          })
        } catch { /* cache already gone */ }
        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { raceId, uid }) => [{ type: "RaceRun", id: `${raceId}_${uid}` }],
    }),

    submitRaceAnswer: builder.mutation<null, { raceId: string, uid: string, roundIndex: number, gameId: string, startedAt: number, seedId: string, currentRoundIndex: number, currentScore: number, seedRoundsCount: number, answer: string, isCorrect: boolean }>({
      queryFn: async ({ raceId, uid, roundIndex, gameId, startedAt: raceStartMs, seedId, currentRoundIndex, currentScore, seedRoundsCount, isCorrect, answer: playerAnswer }, { dispatch }) => {
        try {
          const now = Timestamp.now()
          const newScore = currentScore + (
            isCorrect ? RACE_POINTS_PER_ANSWER : RACE_POINTS_PER_WRONG_ANSWER
          )
          const answer = {
            roundIndex,
            gameId,
            timeMs: Date.now() - raceStartMs,
            answeredAt: now,
            answer: playerAnswer,
            isCorrect,
          }

          const newIndex = currentRoundIndex + 1
          await updateDoc(getRaceRunRef(raceId, uid), {
            score: newScore,
            currentRoundIndex: newIndex,
            answers: arrayUnion(answer),
          })

          // Extend seed if player is within threshold of the end
          if (seedRoundsCount - newIndex <= RACE_SEED_EXTENSION_THRESHOLD) {
            dispatch(cloudFunctionsApi.endpoints.populateRaceSeed.initiate({ seedId, playerCurrentIndex: newIndex }))
          }

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    finishRaceRun: builder.mutation<null, { raceId: string, uid: string, isHost: boolean }>({
      queryFn: async ({ raceId, uid, isHost }) => {
        try {
          await updateDoc(getRaceRunRef(raceId, uid), { finishedAt: Timestamp.now() })
          if (isHost) {
            await updateDoc(getRaceRef(raceId), { status: RACE_STATUS.FINISHED, updatedAt: Timestamp.now() })
          }

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    getRaceRuns: builder.query<RaceRunDocWithId[], { raceId: string }>({
      queryFn: async ({ raceId }) => {
        try {
          const snapshot = await getDocs(
            query(TABLES_SUB_REFS[TABLES.RACE_RUNS](raceId), orderBy("score", "desc")),
          )
          const runs: RaceRunDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = raceRunDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
            if (!error) runs.push(data)
          }

          return { data: runs }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { raceId }) => [{ type: "RaceRuns", id: raceId }],
    }),
  }),
})

export const {
  useCreateRaceMutation,
  useGetRaceByCodeQuery,
  useSubscribeRaceQuery,
  useJoinRaceMutation,
  useStartRaceMutation,
  usePrepareAndStartRaceMutation,
  useFinishRaceMutation,
  useCreateRaceRunMutation,
  useSubscribeRaceRunQuery,
  useSubmitRaceAnswerMutation,
  useFinishRaceRunMutation,
  useGetRaceRunsQuery,
} = raceApi
