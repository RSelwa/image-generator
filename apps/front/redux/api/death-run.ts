"use client"

import { addDoc, arrayUnion, getDoc, getDocs, increment, onSnapshot, orderBy, query, setDoc, Timestamp, type Unsubscribe, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { DEATH_RUN_LIVES, DEATH_RUN_POINTS_PER_ANSWER, DEATH_RUN_SEED_EXTENSION_THRESHOLD, DEATH_RUN_STATUS, TABLES } from "@repo/common"
import { type DeathRunDocWithId, deathRunDocWithIdSchema, type DeathRunRunDocWithId, deathRunRunDocWithIdSchema } from "@repo/schemas"
import { getDeathRunRef, getDeathRunRunRef, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { cloudFunctionsApi } from "@/redux/api/cloud-functions"
import { userApi } from "@/redux/api/user"
import { type SessionUser } from "@/schemas/session"
import { type GlobalError, globalErrorHandler } from "@/utils/error"
import { createPlayerFromSessionUser, generateRandomCode } from "@/utils/player"

const parseDeathRun = (id: string, data: object): DeathRunDocWithId | null => {
  const { data: parsed, error } = deathRunDocWithIdSchema.safeParse({ id, ...data })
  if (error) {
    console.error(`Error parsing death run ${id}:`, error)

    return null
  }

  return parsed
}

export const deathRunApi = createApi({
  reducerPath: "deathRunApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["DeathRun", "DeathRunRun", "DeathRunRuns"],
  endpoints: (builder) => ({
    createDeathRun: builder.mutation<DeathRunDocWithId, { user: SessionUser }>({
      queryFn: async ({ user }) => {
        try {
          const now = Timestamp.now()
          const player = createPlayerFromSessionUser(user)
          const docRef = await addDoc(TABLE_REFS[TABLES.DEATH_RUNS], {
            code: generateRandomCode(),
            hostId: user.id,
            seedId: null,
            status: DEATH_RUN_STATUS.WAITING,
            players: [player],
            playersIds: [user.id],
            lives: DEATH_RUN_LIVES,
            startedAt: null,
            createdAt: now,
            updatedAt: now,
          })
          const docSnap = await getDoc(docRef)
          const deathRun = parseDeathRun(docSnap.id, docSnap.data() as object)
          if (!deathRun) throw new Error("Failed to parse created death run")

          return { data: deathRun }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    getDeathRunByCode: builder.query<DeathRunDocWithId | null, { code: string }>({
      queryFn: async ({ code }) => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.DEATH_RUNS], where("code", "==", code.toUpperCase())),
          )
          if (snapshot.empty) return { data: null }
          const docSnap = snapshot.docs[0]

          return { data: parseDeathRun(docSnap.id, docSnap.data() as object) }
        } catch (error) {
          console.error("Error fetching death run by code:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { code }) => [{ type: "DeathRun", id: code }],
    }),

    subscribeDeathRun: builder.query<DeathRunDocWithId | null, { deathRunId: string }>({
      queryFn: async ({ deathRunId }) => {
        try {
          const docSnap = await getDoc(getDeathRunRef(deathRunId))
          if (!docSnap.exists()) return { data: null }

          return { data: parseDeathRun(docSnap.id, docSnap.data() as object) }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      onCacheEntryAdded: async ({ deathRunId }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        let unsubscribe: Unsubscribe | undefined
        try {
          await cacheDataLoaded
          unsubscribe = onSnapshot(getDeathRunRef(deathRunId), (snapshot) => {
            if (!snapshot.exists()) {
              updateCachedData(() => null)

              return
            }
            const deathRun = parseDeathRun(snapshot.id, snapshot.data() as object)
            if (deathRun) updateCachedData(() => deathRun)
          })
        } catch { /* cache already gone */ }
        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { deathRunId }) => [{ type: "DeathRun", id: deathRunId }],
    }),

    joinDeathRun: builder.mutation<null, { deathRunId: string, user: SessionUser }>({
      queryFn: async ({ deathRunId, user }) => {
        try {
          const player = createPlayerFromSessionUser(user)
          await updateDoc(getDeathRunRef(deathRunId), {
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

    prepareAndStartDeathRun: builder.mutation<null, { deathRunId: string, playersIds: string[], lives: number }>({
      queryFn: async ({ deathRunId, playersIds, lives }, { dispatch }) => {
        try {
          await updateDoc(getDeathRunRef(deathRunId), { status: DEATH_RUN_STATUS.STARTING, updatedAt: Timestamp.now() })

          const now = Timestamp.now()
          const seedDocRef = await addDoc(TABLE_REFS[TABLES.MARATHON_SEEDS], {
            name: `Death Run ${new Date().toLocaleDateString()}`,
            rounds: [],
            createdAt: now,
            updatedAt: now,
          })

          await dispatch(cloudFunctionsApi.endpoints.populateRaceSeed.initiate({ seedId: seedDocRef.id, playerCurrentIndex: 0 }))

          const runNow = Timestamp.now()
          await Promise.all(playersIds.map((uid) =>
            setDoc(getDeathRunRunRef(deathRunId, uid), {
              uid,
              score: 0,
              currentRoundIndex: 0,
              answers: [],
              livesRemaining: lives,
              revivesUsed: 0,
              startedAt: runNow,
              finishedAt: null,
            })
          ))

          await updateDoc(getDeathRunRef(deathRunId), {
            seedId: seedDocRef.id,
            status: DEATH_RUN_STATUS.PLAYING,
            startedAt: runNow,
            updatedAt: runNow,
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    subscribeDeathRunRun: builder.query<DeathRunRunDocWithId | null, { deathRunId: string, uid: string }>({
      queryFn: async ({ deathRunId, uid }) => {
        try {
          const docSnap = await getDoc(getDeathRunRunRef(deathRunId, uid))
          if (!docSnap.exists()) return { data: null }
          const { data, error } = deathRunRunDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (error) throw new Error(error.message)

          return { data }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      onCacheEntryAdded: async ({ deathRunId, uid }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        let unsubscribe: Unsubscribe | undefined
        try {
          await cacheDataLoaded
          unsubscribe = onSnapshot(getDeathRunRunRef(deathRunId, uid), (snapshot) => {
            if (!snapshot.exists()) {
              updateCachedData(() => null)

              return
            }
            const { data, error } = deathRunRunDocWithIdSchema.safeParse({ id: snapshot.id, ...snapshot.data() })
            if (!error) updateCachedData(() => data)
          })
        } catch { /* cache already gone */ }
        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { deathRunId, uid }) => [{ type: "DeathRunRun", id: `${deathRunId}_${uid}` }],
    }),

    submitDeathRunAnswer: builder.mutation<null, { deathRunId: string, uid: string, roundIndex: number, gameId: string, seedId: string, currentRoundIndex: number, currentScore: number, currentLives: number, seedRoundsCount: number, answer: string, isCorrect: boolean }>({
      queryFn: async ({ deathRunId, uid, roundIndex, gameId, seedId, currentRoundIndex, currentScore, currentLives, seedRoundsCount, isCorrect, answer: playerAnswer }, { dispatch }) => {
        try {
          const now = Timestamp.now()
          const newScore = isCorrect ? currentScore + DEATH_RUN_POINTS_PER_ANSWER : currentScore
          const newLives = isCorrect ? currentLives : Math.max(0, currentLives - 1)
          const newIndex = currentRoundIndex + 1

          await updateDoc(getDeathRunRunRef(deathRunId, uid), {
            score: newScore,
            currentRoundIndex: newIndex,
            livesRemaining: newLives,
            answers: arrayUnion({
              roundIndex,
              gameId,
              answer: playerAnswer,
              isCorrect,
              answeredAt: now,
            }),
          })

          if (seedRoundsCount - newIndex <= DEATH_RUN_SEED_EXTENSION_THRESHOLD) {
            dispatch(cloudFunctionsApi.endpoints.populateRaceSeed.initiate({ seedId, playerCurrentIndex: newIndex }))
          }

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    finishDeathRunRun: builder.mutation<null, { deathRunId: string, uid: string }>({
      queryFn: async ({ deathRunId, uid }, { dispatch }) => {
        try {
          const now = Timestamp.now()
          await updateDoc(getDeathRunRunRef(deathRunId, uid), { finishedAt: now })

          const deathRunSnap = await getDoc(getDeathRunRef(deathRunId))
          const playersIds: string[] = deathRunSnap.data()?.playersIds || []

          const runSnaps = await Promise.all(playersIds.map((id) => getDoc(getDeathRunRunRef(deathRunId, id))))
          const allFinished = runSnaps.every((snap) => snap.exists() && snap.data()?.finishedAt)

          if (allFinished) {
            await updateDoc(getDeathRunRef(deathRunId), { status: DEATH_RUN_STATUS.FINISHED, updatedAt: now })
          }

          const runSnap = await getDoc(getDeathRunRunRef(deathRunId, uid))
          const finalScore = runSnap.data()?.score || 0

          const user = await dispatch(userApi.endpoints.getUserById.initiate({ id: uid })).unwrap()
          const currentBest = user?.bestDeathRunScore || 0

          if (finalScore > currentBest) {
            await dispatch(userApi.endpoints.updateUserDoc.initiate({ id: uid, data: { bestDeathRunScore: finalScore } })).unwrap()
          }

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    reviveDeathRunRun: builder.mutation<null, { deathRunId: string, uid: string }>({
      queryFn: async ({ deathRunId, uid }) => {
        try {
          await updateDoc(getDeathRunRunRef(deathRunId, uid), {
            livesRemaining: 1,
            revivesUsed: increment(1),
          })

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    getDeathRunRuns: builder.query<DeathRunRunDocWithId[], { deathRunId: string }>({
      queryFn: async ({ deathRunId }) => {
        try {
          const snapshot = await getDocs(
            query(TABLES_SUB_REFS[TABLES.DEATH_RUN_RUNS](deathRunId), orderBy("score", "desc")),
          )
          const runs: DeathRunRunDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = deathRunRunDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
            if (!error) runs.push(data)
          }

          return { data: runs }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { deathRunId }) => [{ type: "DeathRunRuns", id: deathRunId }],
    }),
  }),
})

export const {
  useCreateDeathRunMutation,
  useGetDeathRunByCodeQuery,
  useSubscribeDeathRunQuery,
  useJoinDeathRunMutation,
  usePrepareAndStartDeathRunMutation,
  useSubscribeDeathRunRunQuery,
  useSubmitDeathRunAnswerMutation,
  useFinishDeathRunRunMutation,
  useReviveDeathRunRunMutation,
  useGetDeathRunRunsQuery,
} = deathRunApi
