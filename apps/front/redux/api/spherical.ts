import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { getIdFromFirestoreRef, TABLES } from "@repo/common"
import {
  type CreateSphericalInput,
  createSphericalInputSchema,
  type SphericalDocWithId,
  sphericalDocWithIdSchema,
  type SphericalEntity,
  sphericalEntitySchema,
  type UpdateSphericalInput,
  updateSphericalInputSchema,
} from "@repo/schemas"
import {
  addDoc,
  collection,
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
// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_SPHERICALS } from "@/constants/api"
import { db } from "@/constants/db"
import {
  getSphericalRef,
  TABLES_GROUP_REFS,
  TABLES_SUB_REFS,
} from "@/constants/db-refs"
import { gameApi } from "@/redux/api/games"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const sphericalApi = createApi({
  reducerPath: "sphericalApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Spherical", "SphericalList", "SphericalCount"],
  endpoints: (builder) => ({
    getSphericals: builder.infiniteQuery<
      SphericalEntity[],
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
            TABLES_GROUP_REFS[TABLES.SPHERICAL],
            ...constraints,
          )

          const snapshot = await getDocs(q)

          const spherical = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const gameId = getIdFromFirestoreRef(doc.data().gameId)

              const game = await dispatch(
                gameApi.endpoints.getGameById.initiate({
                  id: gameId,
                }),
              ).unwrap()

              const { data, error } = sphericalEntitySchema.safeParse({
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

          return { data: spherical }
        } catch (error) {
          console.error("Error fetching games:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_SPHERICALS,
          startAfter: null,
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastItem = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_SPHERICALS

          // No more pages if the last page has fewer items than the limit
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
            .map(({ id }) => ({ type: "Spherical" as const, id })),
          { type: "SphericalList" as const },
        ] : [{ type: "SphericalList" as const }],
    }),
    getSphericalById: builder.query<
      SphericalEntity,
      { gameId: string, id: string }
    >({
      queryFn: async ({ id, gameId }, { dispatch }) => {
        try {
          const docSnap = await getDoc(getSphericalRef(gameId, id))

          if (!docSnap.exists()) {
            throw new Error("Spherical not found")
          }

          const game = await dispatch(
            gameApi.endpoints.getGameById.initiate({
              id: gameId,
            }),
          ).unwrap()

          const { data, error } = sphericalEntitySchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
            game,
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching spherical by ID:", error)
          toast.error(`Error fetching spherical data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Spherical", id }],
    }),
    getTotalSphericalsCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const coll = collection(db, TABLES.SPHERICAL)
          const snapshot = await getCountFromServer(coll)

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching spherical count:", error)
          toast.error("Error fetching spherical count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: [{ type: "SphericalCount" }],
    }),
    deleteSpherical: builder.mutation<null, { gameId: string, id: string }>({
      queryFn: async ({ gameId, id }) => {
        try {
          await deleteDoc(getSphericalRef(gameId, id))

          return { data: null }
        } catch (error) {
          console.error("Error deleting spherical:", error)
          toast.error("Error deleting spherical")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Spherical", id },
        { type: "SphericalList" },
        { type: "SphericalCount" },
      ],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([
            { type: "GameSphericalCount", id: gameId },
            { type: "GameSphericals", id: gameId },
          ]),
        )
      },
    }),
    createSpherical: builder.mutation<
      SphericalDocWithId,
      { gameId: string, data: CreateSphericalInput }
    >({
      queryFn: async ({ gameId, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            createSphericalInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const now = Timestamp.now()
          const docRef = await addDoc(
            TABLES_SUB_REFS[TABLES.SPHERICAL](gameId),
            {
              ...validatedInput,
              createdAt: now,
              updatedAt: now,
            },
          )

          const docSnap = await getDoc(docRef)

          const { data, error } = sphericalDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating spherical:", error)
          toast.error("Error creating spherical")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: [{ type: "SphericalList" }, { type: "SphericalCount" }],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([
            { type: "GameSphericalCount", id: gameId },
            { type: "GameSphericals", id: gameId },
          ]),
        )
      },
    }),
    updateSphericalById: builder.mutation<
      SphericalDocWithId,
      { gameId: string, id: string, data: UpdateSphericalInput }
    >({
      queryFn: async ({ gameId, id, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            updateSphericalInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const sphericalRef = getSphericalRef(gameId, id)
          await updateDoc(sphericalRef, {
            ...validatedInput,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(sphericalRef)

          if (!docSnap.exists()) {
            throw new Error("Spherical not found")
          }

          const { data, error } = sphericalDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating spherical:", error)
          toast.error("Error updating spherical")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Spherical", id },
        { type: "SphericalList" },
      ],
      onQueryStarted: async ({ gameId }, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(
          gameApi.util.invalidateTags([{ type: "GameSphericals", id: gameId }]),
        )
      },
    }),
  }),
})

export const {
  useGetSphericalsInfiniteQuery,
  useGetSphericalByIdQuery,
  useDeleteSphericalMutation,
  useCreateSphericalMutation,
  useUpdateSphericalByIdMutation,
} = sphericalApi
