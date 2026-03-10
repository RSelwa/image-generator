import { deleteDoc, getDoc, getDocs, limit, orderBy, query, type QueryConstraint, setDoc, startAfter, Timestamp, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import {
  type CreateDailyChallengeInput,
  type DailyChallengeDocWithId,
  dailyChallengeDocWithIdSchema,
  type DailyChallengeEntity,
  dailyChallengeEntitySchema,
  type DailyChallengeResultDocWithId,
  dailyChallengeResultDocWithIdSchema,
  type UpdateDailyChallengeInput,
} from "@repo/schemas"
import { DEFAULT_SIZE_DAILY_CHALLENGES } from "@/constants/api"
import { getDailyChallengeRef, getDailyChallengeResultRef, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

const toDailyChallengeEntity = (doc: DailyChallengeDocWithId): DailyChallengeEntity | null => {
  const raw = { ...doc, hasMap: !!doc.mapId }
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
  const { data, error } = dailyChallengeEntitySchema.safeParse(cleaned)

  if (error) {
    console.error(`Daily challenge ${doc.id} is incomplete:`, error)

    return null
  }

  return data
}

const parseChallenges = (snapshot: Awaited<ReturnType<typeof getDocs>>): DailyChallengeDocWithId[] => {
  const challenges: DailyChallengeDocWithId[] = []
  for (const docSnap of snapshot.docs) {
    const { data, error } = dailyChallengeDocWithIdSchema.safeParse({ id: docSnap.id, ...(docSnap.data() as object) })
    if (error) {
      console.error(`Error parsing daily challenge ${docSnap.id}:`, error)
      continue
    }
    challenges.push(data)
  }

  return challenges
}

const getWeekEnd = (weekStart: string): string => {
  const [year, month, day] = weekStart.split("-").map(Number)
  const end = new Date(year, month - 1, day + 6)

  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
}

const getMonthBounds = (year: number, month: number): { start: string, end: string } => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`

  return { start, end }
}

export const dailyChallengeApi = createApi({
  reducerPath: "dailyChallengeApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: [
    "DailyChallenge",
    "DailyChallengesAdmin",
    "DailyChallengeWeek",
    "DailyChallengeMonth",
    "DailyChallengeResult",
    "DailyChallengeResults",
  ],
  endpoints: (builder) => ({
    // User-facing: parses to strict entity schema, fails if doc is incomplete
    getDailyChallengeEntityByDate: builder.query<DailyChallengeEntity | null, { date: string }>({
      queryFn: async ({ date }) => {
        try {
          const docSnap = await getDoc(getDailyChallengeRef(date))

          if (!docSnap.exists()) throw new Error("Daily challenge not found")

          const { data, error } = dailyChallengeDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data: toDailyChallengeEntity(data) }
        } catch (error) {
          console.error(`Error fetching daily challenge entity for date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { date }) => [{ type: "DailyChallenge", id: date }],
    }),

    getDailyChallengeByDate: builder.query<DailyChallengeDocWithId, { date: string }>({
      queryFn: async ({ date }) => {
        try {
          const docSnap = await getDoc(getDailyChallengeRef(date))

          if (!docSnap.exists()) throw new Error("Daily challenge not found")

          const { data, error } = dailyChallengeDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching daily challenge for date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { date }) => [{ type: "DailyChallenge", id: date }],
    }),

    // Admin: infinite query ordered by date desc, cursor-based pagination
    getDailyChallenges: builder.infiniteQuery<
      DailyChallengeDocWithId[],
      void,
      { startAfter?: string, limit?: number }
    >({
      queryFn: async ({ pageParam }) => {
        try {
          const constraints: QueryConstraint[] = [orderBy("date", "desc")]

          if (pageParam.startAfter) constraints.push(startAfter(pageParam.startAfter))
          constraints.push(limit(pageParam.limit || DEFAULT_SIZE_DAILY_CHALLENGES))

          const snapshot = await getDocs(query(TABLE_REFS[TABLES.DAILY_CHALLENGES], ...constraints))

          return { data: parseChallenges(snapshot) }
        } catch (error) {
          console.error("Error fetching daily challenges (admin):", error)

          return { error: globalErrorHandler(error) }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: { limit: DEFAULT_SIZE_DAILY_CHALLENGES, startAfter: undefined },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastItem = lastPage?.at(-1)
          const pageLimit = lastPageParams?.limit || DEFAULT_SIZE_DAILY_CHALLENGES

          if (!lastPage || lastPage.length < pageLimit) return undefined

          return { startAfter: lastItem?.date, limit: pageLimit }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages.flat().map(({ date }) => ({ type: "DailyChallenge" as const, id: date })),
          { type: "DailyChallengesAdmin" },
        ] : [{ type: "DailyChallengesAdmin" }],
    }),

    // Client: fetch a 7-day window (weekStart = Monday YYYY-MM-DD), includes future challenges
    getDailyChallengesByWeek: builder.query<DailyChallengeDocWithId[], { weekStart: string }>({
      queryFn: async ({ weekStart }) => {
        try {
          const weekEnd = getWeekEnd(weekStart)

          const snapshot = await getDocs(
            query(
              TABLE_REFS[TABLES.DAILY_CHALLENGES],
              where("date", ">=", weekStart),
              where("date", "<=", weekEnd),
              orderBy("date", "asc"),
            ),
          )

          return { data: parseChallenges(snapshot) }
        } catch (error) {
          console.error(`Error fetching daily challenges for week: ${weekStart}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { weekStart }) => [{ type: "DailyChallengeWeek", id: weekStart }],
    }),

    // Client: fetch a full calendar month ordered asc (path/calendar overview)
    getDailyChallengesByMonth: builder.query<DailyChallengeDocWithId[], { year: number, month: number }>({
      queryFn: async ({ year, month }) => {
        try {
          const { start, end } = getMonthBounds(year, month)

          const snapshot = await getDocs(
            query(
              TABLE_REFS[TABLES.DAILY_CHALLENGES],
              where("date", ">=", start),
              where("date", "<=", end),
              orderBy("date", "asc"),
            ),
          )

          return { data: parseChallenges(snapshot) }
        } catch (error) {
          console.error(`Error fetching daily challenges for month: ${year}-${month}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { year, month }) => [{ type: "DailyChallengeMonth", id: `${year}-${month}` }],
    }),

    createDailyChallenge: builder.mutation<DailyChallengeDocWithId, CreateDailyChallengeInput>({
      queryFn: async (input) => {
        try {
          const ref = getDailyChallengeRef(input.date)

          await setDoc(ref, input)

          const docSnap = await getDoc(ref)

          const { data, error } = dailyChallengeDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating daily challenge:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: [{ type: "DailyChallengesAdmin" }],
    }),

    updateDailyChallenge: builder.mutation<DailyChallengeDocWithId, { date: string, data: UpdateDailyChallengeInput }>({
      queryFn: async ({ date, data: input }) => {
        try {
          const ref = getDailyChallengeRef(date)

          await updateDoc(ref, input)

          const docSnap = await getDoc(ref)

          if (!docSnap.exists()) throw new Error("Daily challenge not found")

          const { data, error } = dailyChallengeDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error updating daily challenge for date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { date }) => [
        { type: "DailyChallenge", id: date },
        { type: "DailyChallengesAdmin" },
      ],
    }),

    deleteDailyChallenge: builder.mutation<null, { date: string }>({
      queryFn: async ({ date }) => {
        try {
          await deleteDoc(getDailyChallengeRef(date))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting daily challenge for date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { date }) => [
        { type: "DailyChallenge", id: date },
        { type: "DailyChallengesAdmin" },
      ],
    }),

    getMyDailyChallengeResults: builder.query<DailyChallengeResultDocWithId[], { uid: string }>({
      queryFn: async ({ uid }) => {
        try {
          const snapshot = await getDocs(
            query(TABLES_SUB_REFS[TABLES.DAILY_CHALLENGE_RESULTS](uid), orderBy("date", "desc")),
          )

          const results = snapshot.docs
            .map((docSnap) => {
              const { data, error } = dailyChallengeResultDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

              if (error) {
                console.error(`Error parsing daily challenge result ${docSnap.id}:`, error)

                return null
              }

              return data
            })
            .filter((r) => r !== null)

          return { data: results }
        } catch (error) {
          console.error(`Error fetching daily challenge results for user: ${uid}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { uid }) => [{ type: "DailyChallengeResults", id: uid }],
    }),

    getMyDailyChallengeResultByDate: builder.query<DailyChallengeResultDocWithId | null, { uid: string, date: string }>({
      queryFn: async ({ uid, date }) => {
        try {
          const docSnap = await getDoc(getDailyChallengeResultRef(uid, date))

          if (!docSnap.exists()) return { data: null }

          const { data, error } = dailyChallengeResultDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching daily challenge result for user: ${uid}, date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { uid, date }) => [{ type: "DailyChallengeResult", id: `${uid}_${date}` }],
    }),

    submitDailyChallengeResult: builder.mutation<DailyChallengeResultDocWithId, { uid: string, date: string, answer: string, isCorrect: boolean, position?: { x: number, y: number } }>({
      queryFn: async ({ uid, date, answer, isCorrect, position }) => {
        try {
          const ref = getDailyChallengeResultRef(uid, date)

          await setDoc(ref, {
            date,
            answer,
            isCorrect,
            position: position || null,
            completedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(ref)

          const { data, error } = dailyChallengeResultDocWithIdSchema.safeParse({ id: docSnap.id, ...docSnap.data() })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error submitting daily challenge result for user: ${uid}, date: ${date}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { uid, date }) => [
        { type: "DailyChallengeResult", id: `${uid}_${date}` },
        { type: "DailyChallengeResults", id: uid },
      ],
    }),
  }),
})

export const {
  useGetDailyChallengeEntityByDateQuery,
  useGetDailyChallengeByDateQuery,
  useGetDailyChallengesInfiniteQuery,
  useGetDailyChallengesByWeekQuery,
  useGetDailyChallengesByMonthQuery,
  useCreateDailyChallengeMutation,
  useUpdateDailyChallengeMutation,
  useDeleteDailyChallengeMutation,
  useGetMyDailyChallengeResultsQuery,
  useGetMyDailyChallengeResultByDateQuery,
  useSubmitDailyChallengeResultMutation,
} = dailyChallengeApi
