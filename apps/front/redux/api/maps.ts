import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import {
  type CreateMapInput,
  createMapInputSchema,
  type MapDocWithId,
  mapDocWithIdSchema,
  type UpdateMapInput,
  updateMapInputSchema,
} from "@repo/schemas"
import {
  addDoc,
  deleteDoc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  type QueryConstraint,
  startAfter,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { toast } from "sonner"
// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_MAPS } from "@/constants/api"
import { getMapRef, TABLES_GROUP_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { gameApi } from "@/redux/api/games"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const mapApi = createApi({
  reducerPath: "mapApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Map", "MapList", "MapCount"],
  endpoints: (builder) => ({
    getMaps: builder.infiniteQuery<
      MapDocWithId[],
      void,
      { limit?: number, startAfter?: string }
    >({
      queryFn: async ({ pageParam }) => {
        try {
          const definedFieldsConstraints: QueryConstraint[] = []

          if (pageParam.startAfter) {
            definedFieldsConstraints.push(startAfter(pageParam.startAfter))
          }

          if (pageParam.limit)
            definedFieldsConstraints.push(limit(pageParam.limit))

          const q = query(
            TABLES_GROUP_REFS[TABLES.MAPS],
            ...definedFieldsConstraints,
          )

          const snapshot = await getDocs(q)

          const maps = snapshot.docs.map((doc) => {
            const { data, error } = mapDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
            })

            if (error || !data)
              throw new Error(error?.message || "Data parsing error")

            return data
          })

          return { data: maps }
        } catch (error) {
          console.error("Error fetching maps:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_MAPS,
          startAfter: "",
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastMap = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_MAPS

          return {
            startAfter: lastMap?.id,
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "Map" as const, id })),
          { type: "MapList" as const },
        ] : [{ type: "MapList" as const }],
    }),
    getMapsByGameId: builder.query<MapDocWithId[], { gameId: string }>({
      queryFn: async ({ gameId }) => {
        try {
          const q = query(TABLES_SUB_REFS[TABLES.MAPS](gameId))
          const snapshot = await getDocs(q)

          const maps = snapshot.docs.map((doc) => {
            const { data, error } = mapDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
            })

            if (error || !data)
              throw new Error(error?.message || "Data parsing error")

            return data
          })

          return { data: maps }
        } catch (error) {
          console.error("Error fetching maps by game ID:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (result) =>
        result ? [
          ...result.map(({ id }) => ({ type: "Map" as const, id })),
          { type: "MapList" as const },
        ] : [{ type: "MapList" as const }],
    }),
    getMapById: builder.query<MapDocWithId, { gameId: string, id: string }>({
      queryFn: async ({ id, gameId }) => {
        try {
          const docSnap = await getDoc(getMapRef(gameId, id))

          if (!docSnap.exists()) {
            throw new Error("Map not found")
          }

          const { data, error } = mapDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching map by ID:", error)
          toast.error(`Error fetching map data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Map", id }],
    }),
    getTotalMapsCount: builder.query<number, { gameId: string }>({
      queryFn: async ({ gameId }) => {
        try {
          const coll = TABLES_SUB_REFS[TABLES.MAPS](gameId)
          const snapshot = await getCountFromServer(coll)

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching map count:", error)
          toast.error("Error fetching map count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: [{ type: "MapCount" }],
    }),
    deleteMap: builder.mutation<null, { gameId: string, id: string }>({
      queryFn: async ({ gameId, id }) => {
        try {
          await deleteDoc(getMapRef(gameId, id))

          return { data: null }
        } catch (error) {
          console.error("Error deleting map:", error)
          toast.error("Error deleting map")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Map", id },
        { type: "MapList" },
        { type: "MapCount" },
      ],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([
            { type: "GameMapCount", id: gameId },
            { type: "GameMaps", id: gameId },
            { type: "GameList" },
          ]),
        )
      },
    }),
    createMap: builder.mutation<
      MapDocWithId,
      { gameId: string, data: CreateMapInput }
    >({
      queryFn: async ({ gameId, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            createMapInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const now = Timestamp.now()
          const docRef = await addDoc(TABLES_SUB_REFS[TABLES.MAPS](gameId), {
            ...validatedInput,
            createdAt: now,
            updatedAt: now,
          })

          const docSnap = await getDoc(docRef)

          const { data, error } = mapDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating map:", error)
          toast.error("Error creating map")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: [{ type: "MapList" }, { type: "MapCount" }],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([
            { type: "GameMapCount", id: gameId },
            { type: "GameMaps", id: gameId },
            { type: "GameList" },
          ]),
        )
      },
    }),
    updateMapById: builder.mutation<
      MapDocWithId,
      { gameId: string, id: string, data: UpdateMapInput }
    >({
      queryFn: async ({ gameId, id, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            updateMapInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const mapRef = getMapRef(gameId, id)
          await updateDoc(mapRef, {
            ...validatedInput,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(mapRef)

          if (!docSnap.exists()) {
            throw new Error("Map not found")
          }

          const { data, error } = mapDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating map:", error)
          toast.error("Error updating map")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Map", id },
        { type: "MapList" },
      ],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([{ type: "GameMaps", id: gameId }]),
        )
      },
    }),
  }),
})

export const {
  useGetMapsInfiniteQuery,
  useGetMapsByGameIdQuery,
  useGetMapByIdQuery,
  useGetTotalMapsCountQuery,
  useDeleteMapMutation,
  useCreateMapMutation,
  useUpdateMapByIdMutation,
} = mapApi
