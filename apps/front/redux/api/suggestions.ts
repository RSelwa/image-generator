import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type SuggestionDoc, type SuggestionDocWithId, suggestionsDocWithIdSchema } from "@repo/schemas"
import { addDoc, deleteDoc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, type QueryConstraint, serverTimestamp, startAfter, Timestamp, updateDoc, where } from "firebase/firestore"
import { DEFAULT_SIZE_SUGGESTIONS } from "@/constants/api"
import { getSuggestionRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const suggestionsApi = createApi({
  reducerPath: "suggestionsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Suggestion", "SuggestionList"],
  endpoints: (builder) => ({
    getSuggestionsCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const usersCount = await getCountFromServer(TABLE_REFS[TABLES.SUGGESTIONS])

          return { data: usersCount.data().count }
        } catch (error) {
          console.error("Error fetching users count", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: () => [{ type: "SuggestionList" }]
    }),
    getSuggestionById: builder.query<SuggestionDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getSuggestionRef(id))

          if (!docSnap.exists()) {
            throw new Error("Suggestion not found")
          }

          const { data, error } = suggestionsDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching suggestion by ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Suggestion", id }],
    }),
    getMySuggestions: builder.query<SuggestionDocWithId[], { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const q = query(
            TABLE_REFS[TABLES.SUGGESTIONS],
            where("createdBy", "==", userId),
            orderBy("createdAt", "desc"),
          )
          const snapshot = await getDocs(q)

          const suggestions: SuggestionDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = suggestionsDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...docSnap.data(),
            })

            if (error) {
              console.error(`Error parsing suggestion ${docSnap.id}:`, error)
              continue
            }

            suggestions.push(data)
          }

          return { data: suggestions }
        } catch (error) {
          console.error("Error fetching user suggestions:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: ["SuggestionList"],
    }),
    getAllSuggestions: builder.infiniteQuery<
      SuggestionDocWithId[],
      void,
      { limit?: number, startAfter?: number }
    >({
      queryFn: async ({ pageParam }) => {
        try {
          const constraints: QueryConstraint[] = [
            orderBy("createdAt", "desc"),
          ]

          if (pageParam.startAfter) {
            constraints.push(startAfter(Timestamp.fromMillis(pageParam.startAfter)))
          }

          if (pageParam.limit) {
            constraints.push(limit(pageParam.limit))
          }

          const q = query(
            TABLE_REFS[TABLES.SUGGESTIONS],
            ...constraints,
          )
          const snapshot = await getDocs(q)

          const suggestions: SuggestionDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = suggestionsDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...docSnap.data(),
            })

            if (error) {
              console.error(`Error parsing suggestion ${docSnap.id}:`, error)
              continue
            }

            suggestions.push(data)
          }

          return { data: suggestions }
        } catch (error) {
          console.error("Error fetching all suggestions:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_SUGGESTIONS,
          startAfter: 0,
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastSuggestion = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_SUGGESTIONS

          if (!lastPage || lastPage.length < limitValue) {
            return undefined
          }

          return {
            startAfter: lastSuggestion?.createdAt?.toMillis() || 0,
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "Suggestion" as const, id })),
          "SuggestionList",
        ] : ["SuggestionList"],
    }),
    createSuggestion: builder.mutation<SuggestionDocWithId, Omit<SuggestionDoc, "createdAt" | "updatedAt">>({
      queryFn: async (input) => {
        try {
          const docRef = await addDoc(TABLE_REFS[TABLES.SUGGESTIONS], {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          const docSnap = await getDoc(docRef)

          const { data, error } = suggestionsDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating suggestion:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["SuggestionList"],
    }),
    updateSuggestion: builder.mutation<null, { id: string } & Partial<SuggestionDoc>>({
      queryFn: async ({ id, ...updates }) => {
        try {
          await updateDoc(getSuggestionRef(id), {
            ...updates,
            updatedAt: serverTimestamp(),
          })

          return { data: null }
        } catch (error) {
          console.error(`Error updating suggestion ${id}:`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      onQueryStarted: async ({ id, ...updates }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          suggestionsApi.util.updateQueryData("getSuggestionById", { id }, (draft) => {
            if (!draft) return
            Object.assign(draft, updates, { id })
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Suggestion", id },
        "SuggestionList",
      ],
    }),
    deleteSuggestion: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          await deleteDoc(getSuggestionRef(id))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting suggestion ${id}:`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Suggestion", id },
        "SuggestionList",
      ],
    }),
  }),
})

export const {
  useGetSuggestionByIdQuery,
  useGetMySuggestionsQuery,
  useGetAllSuggestionsInfiniteQuery,
  useCreateSuggestionMutation,
  useUpdateSuggestionMutation,
  useDeleteSuggestionMutation,
  useGetSuggestionsCountQuery
} = suggestionsApi
