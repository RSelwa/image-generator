import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import {
  type Achievement,
  achievementDocSchema,
  type AchievementEvent,
  achievementSchema,
  type UnlockedAchievementDoc,
  unlockedAchievementDocSchema,
} from "@repo/schemas"
import {
  deleteDoc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from "firebase/firestore"
import { z } from "zod"
import {
  getAchievementRef,
  TABLE_REFS,
  TABLES_SUB_REFS,
} from "@/constants/db-refs"
import { auth, db } from "@/constants/db"
import { API_ENDPOINTS } from "@/constants/mapping"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

const ACHIEVEMENT_KEY_TAKEN_MESSAGE =
  "An achievement with this key already exists"

const achievementEventResultSchema = z.discriminatedUnion("unlocked", [
  z.object({ unlocked: z.literal(true), reward: z.number() }),
  z.object({ unlocked: z.literal(false) }),
])

type AchievementEventResult = z.infer<typeof achievementEventResultSchema>

export const achievementsApi = createApi({
  reducerPath: "achievementsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Achievement", "AchievementList", "UnlockedAchievements"],
  endpoints: (builder) => ({
    getAllAchievements: builder.query<Achievement[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(TABLE_REFS[TABLES.ACHIEVEMENTS])

          const achievements = snapshot.docs
            .map((doc) => {
              const { data, error } = achievementSchema.safeParse({
                key: doc.id,
                ...doc.data(),
              })

              if (error) {
                console.error(`Error parsing achievement: ${doc.id}`, error)

                return null
              }

              return data
            })
            .filter((achievement) => achievement !== null)

          return { data: achievements }
        } catch (error) {
          console.error("Error fetching achievements:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ key }) => ({
                type: "Achievement" as const,
                id: key,
              })),
              "AchievementList",
            ]
          : ["AchievementList"],
    }),
    getAchievementByKey: builder.query<Achievement | null, { key: string }>({
      queryFn: async ({ key }) => {
        try {
          const docSnap = await getDoc(getAchievementRef(key))

          if (!docSnap.exists()) return { data: null }

          const { data, error } = achievementSchema.safeParse({
            key: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching achievement: ${key}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { key }) => [
        { type: "Achievement", id: key },
      ],
    }),
    getUnlockedAchievements: builder.query<
      Record<string, UnlockedAchievementDoc>,
      { uid: string }
    >({
      queryFn: async ({ uid }) => {
        try {
          const snapshot = await getDocs(
            TABLES_SUB_REFS[TABLES.UNLOCKED_ACHIEVEMENTS](uid),
          )

          const unlockedAchievements = snapshot.docs.flatMap((doc) => {
            const { data, error } = unlockedAchievementDocSchema.safeParse(
              doc.data(),
            )

            if (error) {
              console.error(
                `Error parsing unlocked achievement: ${doc.id}`,
                error,
              )

              return []
            }

            return [[doc.id, data] as const]
          })

          return { data: Object.fromEntries(unlockedAchievements) }
        } catch (error) {
          console.error(`Error fetching unlocked achievements: ${uid}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: ["UnlockedAchievements"],
    }),
    sendAchievementEvent: builder.mutation<
      AchievementEventResult,
      AchievementEvent
    >({
      queryFn: async (event) => {
        try {
          const token = await auth.currentUser?.getIdToken()

          if (!token) throw new Error("No authenticated user found")

          const response = await fetch(API_ENDPOINTS.ACHIEVEMENT_EVENTS, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(event),
          })

          if (!response.ok) {
            throw new Error(
              `Failed to send achievement event: ${await response.text()}`,
            )
          }

          return {
            data: achievementEventResultSchema.parse(await response.json()),
          }
        } catch (error) {
          console.error(`Error sending achievement event: ${event.key}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, error) =>
        error ? [] : ["UnlockedAchievements"],
    }),
    createAchievement: builder.mutation<Achievement, Achievement>({
      queryFn: async (input) => {
        try {
          const achievement = achievementSchema.parse(input)
          const ref = getAchievementRef(achievement.key)

          await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(ref)

            if (docSnap.exists()) throw new Error(ACHIEVEMENT_KEY_TAKEN_MESSAGE)

            transaction.set(ref, achievementDocSchema.parse(achievement))
          })

          return { data: achievement }
        } catch (error) {
          console.error("Error creating achievement:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["AchievementList"],
    }),
    updateAchievement: builder.mutation<Achievement, Achievement>({
      queryFn: async (input) => {
        try {
          const achievement = achievementSchema.parse(input)

          await setDoc(
            getAchievementRef(achievement.key),
            achievementDocSchema.parse(achievement),
          )

          return { data: achievement }
        } catch (error) {
          console.error(`Error updating achievement: ${input.key}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { key }) => [
        { type: "Achievement", id: key },
        "AchievementList",
      ],
    }),
    deleteAchievement: builder.mutation<null, { key: string }>({
      queryFn: async ({ key }) => {
        try {
          await deleteDoc(getAchievementRef(key))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting achievement: ${key}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { key }) => [
        { type: "Achievement", id: key },
        "AchievementList",
      ],
    }),
  }),
})

export const {
  useGetAllAchievementsQuery,
  useGetAchievementByKeyQuery,
  useGetUnlockedAchievementsQuery,
  useSendAchievementEventMutation,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
} = achievementsApi
