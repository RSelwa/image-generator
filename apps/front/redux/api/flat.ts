import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { getIdFromFirestoreRef, TABLES } from "@repo/common"
import {
  type CreateFlatInput,
  createFlatInputSchema,
  type FlatDocWithId,
  flatDocWithIdSchema,
  type FlatEntity,
  flatEntitySchema,
  type UpdateFlatInput,
  updateFlatInputSchema,
} from "@repo/schemas"
import {
  addDoc,
  deleteDoc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryConstraint,
  startAfter,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { toast } from "sonner"
import { DEFAULT_SIZE_FLATS } from "@/constants/api"
import {
  getFlatRef,
  TABLES_GROUP_REFS,
  TABLES_SUB_REFS,
} from "@/constants/db-refs"
import { gameApi } from "@/redux/api/games"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const flatApi = createApi({
  reducerPath: "flatApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Flat", "FlatList", "FlatCount"],
  endpoints: (builder) => ({
    getFlats: builder.infiniteQuery<
      FlatEntity[],
      void,
      { limit?: number, startAfter?: Timestamp | null }
    >({
      queryFn: async ({ pageParam }, { dispatch }) => {
        try {
          const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]

          if (pageParam.startAfter) {
            constraints.push(startAfter(pageParam.startAfter))
          }

          if (pageParam.limit)
            constraints.push(limit(pageParam.limit))

          const q = query(
            TABLES_GROUP_REFS[TABLES.FLAT],
            ...constraints,
          )

          const snapshot = await getDocs(q)

          const flats = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const gameId = getIdFromFirestoreRef(doc.data().gameId)

              const game = await dispatch(
                gameApi.endpoints.getGameById.initiate({
                  id: gameId,
                }),
              ).unwrap()

              const { data, error } = flatEntitySchema.safeParse({
                id: doc.id,
                ...doc.data(),
                gameId,
                game,
              })

              if (error || !data)
                throw new Error(error.message || "Data parsing error")

              return data
            }),
          )

          return { data: flats }
        } catch (error) {
          console.error("Error fetching flats:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_FLATS,
          startAfter: null,
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastItem = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_FLATS

          if (!lastPage || lastPage.length < limitValue) {
            return undefined
          }

          return {
            startAfter: lastItem?.createdAt || null,
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "Flat" as const, id })),
          { type: "FlatList" as const },
        ] : [{ type: "FlatList" as const }],
    }),
    getFlatById: builder.query<
      FlatEntity,
      { gameId: string, id: string }
    >({
      queryFn: async ({ id, gameId }, { dispatch }) => {
        try {
          const docSnap = await getDoc(getFlatRef(gameId, id))

          if (!docSnap.exists()) {
            throw new Error("Flat not found")
          }

          const game = await dispatch(
            gameApi.endpoints.getGameById.initiate({
              id: gameId,
            }),
          ).unwrap()

          const { data, error } = flatEntitySchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
            game,
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching flat by ID:", error)
          toast.error(`Error fetching flat data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Flat", id }],
    }),
    getFlatsByGameId: builder.query<
      FlatDocWithId[],
      { gameId: string }
    >({
      queryFn: async ({ gameId }) => {
        try {
          const q = query(
            TABLES_SUB_REFS[TABLES.FLAT](gameId),
            orderBy("createdAt", "desc"),
          )

          const snapshot = await getDocs(q)

          const flats = snapshot.docs.map((doc) => {
            const { data, error } = flatDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
            })

            if (error || !data)
              throw new Error(error.message || "Data parsing error")

            return data
          })

          return { data: flats }
        } catch (error) {
          console.error("Error fetching flats by game ID:", error)
          toast.error("Error fetching flats")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { gameId }) => [
        { type: "FlatList" },
        { type: "Flat", id: `game-${gameId}` },
      ],
    }),
    getTotalFlatsCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const snapshot = await getCountFromServer(TABLES_GROUP_REFS[TABLES.FLAT])

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching flat count:", error)
          toast.error("Error fetching flat count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: [{ type: "FlatCount" }],
    }),
    deleteFlat: builder.mutation<null, { gameId: string, id: string }>({
      queryFn: async ({ gameId, id }) => {
        try {
          await deleteDoc(getFlatRef(gameId, id))

          return { data: null }
        } catch (error) {
          console.error("Error deleting flat:", error)
          toast.error("Error deleting flat")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Flat", id },
        { type: "FlatList" },
        { type: "FlatCount" },
      ],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([{ type: "GameFlatCount", id: gameId }]),
        )
      },
    }),
    createFlat: builder.mutation<
      FlatDocWithId,
      { gameId: string, data: CreateFlatInput }
    >({
      queryFn: async ({ gameId, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            createFlatInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const now = Timestamp.now()
          const docRef = await addDoc(
            TABLES_SUB_REFS[TABLES.FLAT](gameId),
            {
              ...validatedInput,
              createdAt: now,
              updatedAt: now,
            },
          )

          const docSnap = await getDoc(docRef)

          const { data, error } = flatDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating flat:", error)
          toast.error("Error creating flat")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: [{ type: "FlatList" }, { type: "FlatCount" }],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([{ type: "GameFlatCount", id: gameId }]),
        )
      },
    }),
    updateFlatById: builder.mutation<
      FlatDocWithId,
      { gameId: string, id: string, data: UpdateFlatInput }
    >({
      queryFn: async ({ gameId, id, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            updateFlatInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const flatRef = getFlatRef(gameId, id)
          await updateDoc(flatRef, {
            ...validatedInput,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(flatRef)

          if (!docSnap.exists()) {
            throw new Error("Flat not found")
          }

          const { data, error } = flatDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating flat:", error)
          toast.error("Error updating flat")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Flat", id },
        { type: "FlatList" },
      ],
    }),
  }),
})

export const {
  useGetFlatsInfiniteQuery,
  useGetFlatByIdQuery,
  useGetFlatsByGameIdQuery,
  useGetTotalFlatsCountQuery,
  useDeleteFlatMutation,
  useCreateFlatMutation,
  useUpdateFlatByIdMutation,
} = flatApi
