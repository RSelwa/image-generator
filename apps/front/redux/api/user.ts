import { collectionGroup, getCountFromServer, getDoc, getDocs, limit, orderBy, query, type QueryConstraint, startAfter, Timestamp, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES, USERS_FIELDS } from "@repo/common"
import { type DeathRunLeaderboardPlayer, deathRunLeaderboardPlayerSchema, type RaceLeaderboardPlayer, raceLeaderboardPlayerSchema, raceRunDocSchema, type StreakLeaderboardPlayer, streakLeaderboardPlayerSchema, type UserDoc, type userDocWithId, userDocWithIdSchema, type WeeklyRaceLeaderboardPlayer, weeklyRaceLeaderboardPlayerSchema } from "@repo/schemas"
import { DEFAULT_SIZE_USERS } from "@/constants/api"
import { db } from "@/constants/db"
import { getUserRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

const ignoreAnonymousUsersConstraint: QueryConstraint = where(USERS_FIELDS.IS_ANONYMOUS_USER, "==", false)

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "UserList"],
  endpoints: (builder) => ({
    getUsers: builder.infiniteQuery<
      userDocWithId[],
      void,
      { limit?: number, startAfter?: number }
    >({
      queryFn: async ({ pageParam }) => {
        try {
          const constraints: QueryConstraint[] = [
            orderBy("createdAt", "desc"),
            ignoreAnonymousUsersConstraint,
          ]

          if (pageParam.startAfter)
            constraints.push(startAfter(Timestamp.fromMillis(pageParam.startAfter)))

          if (pageParam.limit)
            constraints.push(limit(pageParam.limit))

          const q = query(
            TABLE_REFS[TABLES.USERS],
            ...constraints,
          )
          const snapshot = await getDocs(q)

          const users: userDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = userDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...docSnap.data(),
            })

            if (error) {
              console.error(`Error parsing user ${docSnap.id}:`, error)
              continue
            }

            users.push(data)
          }

          return { data: users }
        } catch (error) {
          console.error("Error fetching users:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_USERS,
          startAfter: undefined,
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastUser = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_USERS

          if (!lastPage || lastPage.length < limitValue) {
            return undefined
          }

          return {
            startAfter: lastUser?.createdAt?.toMillis(),
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "User" as const, id })),
          "UserList",
        ] : ["UserList"],
    }),
    getUsersCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const q = query(TABLE_REFS[TABLES.USERS], ignoreAnonymousUsersConstraint)
          const usersCount = await getCountFromServer(q)

          return { data: usersCount.data().count }
        } catch (error) {
          console.error("Error fetching users count", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    }),
    updateUserDoc: builder.mutation<null, { id: string, data: Partial<UserDoc> }>({
      queryFn: async ({ id, data }) => {
        try {
          const userRef = getUserRef(id)
          await updateDoc(userRef, {
            ...data,
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          console.error(`Error updating user doc with ID: ${id}`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_, error, { id }) =>
        error ? [] : [{ type: "User", id }, "UserList"],
    }),
    getTopPlayersByMaxStreak: builder.query<StreakLeaderboardPlayer[], void>({
      queryFn: async () => {
        try {
          const q = query(
            TABLE_REFS[TABLES.USERS],
            ignoreAnonymousUsersConstraint,
            where("maxStreak", ">", 0),
            orderBy("maxStreak", "desc"),
            limit(10),
          )
          const snapshot = await getDocs(q)

          const players: StreakLeaderboardPlayer[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = streakLeaderboardPlayerSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
            if (error) continue
            players.push(data)
          }

          return { data: players }
        } catch (error) {
          console.error("Error fetching players by best streak", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    getTopPlayersByBestRaceScore: builder.query<RaceLeaderboardPlayer[], void>({
      queryFn: async () => {
        try {
          const q = query(
            TABLE_REFS[TABLES.USERS],
            ignoreAnonymousUsersConstraint,
            where("bestRaceScore", ">", 0),
            orderBy("bestRaceScore", "desc"),
            limit(10),
          )
          const snapshot = await getDocs(q)

          const players: RaceLeaderboardPlayer[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = raceLeaderboardPlayerSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
            if (error) continue
            players.push(data)
          }

          return { data: players }
        } catch (error) {
          console.error("Error fetching top players by best race score", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    getTopPlayersByBestDeathRunScore: builder.query<DeathRunLeaderboardPlayer[], void>({
      queryFn: async () => {
        try {
          const q = query(
            TABLE_REFS[TABLES.USERS],
            ignoreAnonymousUsersConstraint,
            where("bestDeathRunScore", ">", 0),
            orderBy("bestDeathRunScore", "desc"),
            limit(10),
          )
          const snapshot = await getDocs(q)

          const players: DeathRunLeaderboardPlayer[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = deathRunLeaderboardPlayerSchema.safeParse({ id: docSnap.id, ...docSnap.data() })
            if (error) continue
            players.push(data)
          }

          return { data: players }
        } catch (error) {
          console.error("Error fetching top players by best death run score", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    getTopRaceRunsByWeek: builder.query<WeeklyRaceLeaderboardPlayer[], void>({
      queryFn: async () => {
        try {
          const now = new Date()
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
          startOfWeek.setHours(0, 0, 0, 0)

          const q = query(
            collectionGroup(db, TABLES.RACE_RUNS),
            where("finishedAt", ">=", Timestamp.fromDate(startOfWeek)),
            orderBy("finishedAt", "desc"),
            limit(50),
          )
          const snapshot = await getDocs(q)

          const runs: Array<{ uid: string, score: number }> = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = raceRunDocSchema.safeParse(docSnap.data())
            if (error) continue
            runs.push({ uid: data.uid, score: data.score })
          }

          runs.sort((a, b) => b.score - a.score)
          const topRuns = runs.slice(0, 10)

          const players = (await Promise.all(
            topRuns.map(async (run) => {
              const userDoc = await getDoc(getUserRef(run.uid))
              if (!userDoc.exists()) return null
              const { data, error } = weeklyRaceLeaderboardPlayerSchema.safeParse({ id: userDoc.id, ...userDoc.data(), score: run.score })
              if (error) return null

              return data
            })
          )).filter((p): p is WeeklyRaceLeaderboardPlayer => p !== null)

          return { data: players }
        } catch (error) {
          console.error("Error fetching top race runs by week", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    getUserById: builder.query<userDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getUserRef(id))

          if (!docSnap.exists()) {
            return { error: { status: 404, data: "User not found" } }
          }

          const { data, error } = userDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) {
            console.error(`Error parsing user with ID: ${id}`, error)

            return { error: { status: 500, data: "Data parsing error" } }
          }

          return { data }
        } catch (error) {
          console.error(`Error fetching user with ID: ${id}`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    })
  }),
})

export const { useGetUsersInfiniteQuery, useUpdateUserDocMutation, useGetUsersCountQuery, useGetUserByIdQuery, useGetTopPlayersByMaxStreakQuery, useGetTopPlayersByBestRaceScoreQuery, useGetTopPlayersByBestDeathRunScoreQuery, useGetTopRaceRunsByWeekQuery } = userApi
