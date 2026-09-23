import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import {
  type AchievementDoc,
  achievementDocSchema,
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
import {
  getAchievementRef,
  TABLE_REFS,
  TABLES_SUB_REFS,
} from "@/constants/db-refs"
import { db } from "@/constants/db"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

const ACHIEVEMENT_KEY_TAKEN_MESSAGE =
  "An achievement with this key already exists"

export const achievementsApi = createApi({
  reducerPath: "achievementsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Achievement", "AchievementList"],
  endpoints: (builder) => ({
    getAllAchievements: builder.query<AchievementDoc[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(TABLE_REFS[TABLES.ACHIEVEMENTS])

          const achievements = snapshot.docs
            .map((doc) => {
              const { data, error } = achievementDocSchema.safeParse(doc.data())

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
    getAchievementByKey: builder.query<AchievementDoc | null, { key: string }>({
      queryFn: async ({ key }) => {
        try {
          const docSnap = await getDoc(getAchievementRef(key))

          if (!docSnap.exists()) return { data: null }

          const { data, error } = achievementDocSchema.safeParse(docSnap.data())

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
    }),
    createAchievement: builder.mutation<AchievementDoc, AchievementDoc>({
      queryFn: async (input) => {
        try {
          const achievement = achievementDocSchema.parse(input)
          const ref = getAchievementRef(achievement.key)

          await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(ref)

            if (docSnap.exists()) throw new Error(ACHIEVEMENT_KEY_TAKEN_MESSAGE)

            transaction.set(ref, achievement)
          })

          return { data: achievement }
        } catch (error) {
          console.error("Error creating achievement:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["AchievementList"],
    }),
    updateAchievement: builder.mutation<AchievementDoc, AchievementDoc>({
      queryFn: async (input) => {
        try {
          const achievement = achievementDocSchema.parse(input)

          await setDoc(getAchievementRef(achievement.key), achievement)

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
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
} = achievementsApi
