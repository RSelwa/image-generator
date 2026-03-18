"use client"

import { addDoc, deleteDoc, getDocs, limit, onSnapshot, orderBy, query, type Unsubscribe } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type MarathonSeedDocWithId, marathonSeedDocWithIdSchema } from "@repo/schemas"
import { getMarathonSeedRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

const DEFAULT_PAGE_SIZE = 30

export const marathonSeedApi = createApi({
  reducerPath: "marathonSeedApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["MarathonSeed", "MarathonSeeds"],
  endpoints: (builder) => ({
    getMarathonSeeds: builder.infiniteQuery<MarathonSeedDocWithId[], void, number>({
      queryFn: async ({ pageParam }) => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.MARATHON_SEEDS], orderBy("createdAt", "desc"), limit(pageParam || DEFAULT_PAGE_SIZE)),
          )

          const seeds = snapshot.docs.map((doc) => {
            const seedData = doc.data()
            const { data, error } = marathonSeedDocWithIdSchema.safeParse({ id: doc.id, ...seedData })
            if (error) {
              console.error(`Error parsing marathon seed ${doc.id}:`, error)

              return null
            }

            return data
          }).filter((seed) => seed !== null)

          return { data: seeds }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: DEFAULT_PAGE_SIZE,
        getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length < DEFAULT_PAGE_SIZE ? undefined : lastPageParam),
      },
      providesTags: ["MarathonSeeds"],
    }),

    subscribeMarathonSeed: builder.query<MarathonSeedDocWithId | null, { seedId: string }>({
      queryFn: async ({ seedId }) => {
        try {
          const { getDoc } = await import("@firebase/firestore")
          const docSnap = await getDoc(getMarathonSeedRef(seedId))
          if (!docSnap.exists()) return { data: null }
          const { data, error } = marathonSeedDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (error) throw new Error(error.message)

          return { data }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      onCacheEntryAdded: async ({ seedId }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        let unsubscribe: Unsubscribe | undefined
        try {
          await cacheDataLoaded
          unsubscribe = onSnapshot(getMarathonSeedRef(seedId), (snapshot) => {
            if (!snapshot.exists()) {
              updateCachedData(() => null)

              return
            }
            const { data, error } = marathonSeedDocWithIdSchema.safeParse({ id: snapshot.id, ...snapshot.data() })
            if (!error) updateCachedData(() => data)
          })
        } catch { /* cache already gone */ }
        await cacheEntryRemoved
        unsubscribe?.()
      },
      providesTags: (_result, _error, { seedId }) => [{ type: "MarathonSeed", id: seedId }],
    }),

    createMarathonSeed: builder.mutation<MarathonSeedDocWithId, { name: string }>({
      queryFn: async ({ name }) => {
        try {
          const { Timestamp } = await import("@firebase/firestore")
          const now = Timestamp.now()
          const docRef = await addDoc(TABLE_REFS[TABLES.MARATHON_SEEDS], {
            name,
            rounds: [],
            createdAt: now,
            updatedAt: now,
          })
          const { getDoc } = await import("@firebase/firestore")
          const docSnap = await getDoc(docRef)
          const { data, error } = marathonSeedDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
          if (error) throw new Error(error.message)

          return { data }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["MarathonSeeds"],
    }),

    deleteMarathonSeed: builder.mutation<null, { seedId: string }>({
      queryFn: async ({ seedId }) => {
        try {
          await deleteDoc(getMarathonSeedRef(seedId))

          return { data: null }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { seedId }) => [{ type: "MarathonSeed", id: seedId }, "MarathonSeeds"],
    }),
  }),
})

export const {
  useGetMarathonSeedsInfiniteQuery,
  useSubscribeMarathonSeedQuery,
  useCreateMarathonSeedMutation,
  useDeleteMarathonSeedMutation,
} = marathonSeedApi
