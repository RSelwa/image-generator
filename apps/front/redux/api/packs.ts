import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { userCardDocSchema } from "@repo/schemas"
import { getDocs } from "firebase/firestore"
import { TABLES_SUB_REFS } from "@/constants/db-refs"
import { auth } from "@/constants/db"
import { API_ENDPOINTS } from "@/constants/mapping"
import { type OpenPackResponse, openPackResponseSchema } from "@/schemas/packs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const packsApi = createApi({
  reducerPath: "packsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["UserCards"],
  endpoints: (builder) => ({
    getUserCardCounts: builder.query<Record<string, number>, { uid: string }>({
      queryFn: async ({ uid }) => {
        try {
          const snapshot = await getDocs(TABLES_SUB_REFS[TABLES.CARDS](uid))

          const counts = snapshot.docs.flatMap((doc) => {
            const { data, error } = userCardDocSchema.safeParse(doc.data())

            if (error) {
              console.error(`Error parsing user card: ${doc.id}`, error)

              return []
            }

            return [[doc.id, data.count] as const]
          })

          return { data: Object.fromEntries(counts) }
        } catch (error) {
          console.error(`Error fetching user cards: ${uid}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: ["UserCards"],
    }),
    openPack: builder.mutation<OpenPackResponse, void>({
      queryFn: async () => {
        try {
          const token = await auth.currentUser?.getIdToken()

          if (!token) {
            return {
              error: globalErrorHandler(
                new Error("No authenticated user found"),
              ),
            }
          }

          const response = await fetch(API_ENDPOINTS.OPEN_PACK, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            return {
              error: globalErrorHandler(
                new Error(`Failed to open a pack: ${await response.text()}`),
              ),
            }
          }

          return {
            data: openPackResponseSchema.parse(await response.json()),
          }
        } catch (error) {
          console.error("Error opening a pack", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, error) => (error ? [] : ["UserCards"]),
    }),
  }),
})

export const { useGetUserCardCountsQuery, useOpenPackMutation } = packsApi
