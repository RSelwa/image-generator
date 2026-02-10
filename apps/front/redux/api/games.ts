import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import {
  type CreateGameInput,
  gameDocSchema,
  type GameDocWithId,
  gameDocWithIdSchema,
  type GameEntity,
  gameEntitySchema,
  type MapDocWithId,
  mapDocWithIdSchema,
  type SphericalDocWithId,
  sphericalDocWithIdSchema,
  type UpdateGameInput,
  updateGameInputSchema,
} from "@repo/schemas"
import {
  addDoc,
  collection,
  deleteDoc,
  documentId,
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
import { DEFAULT_SIZE_GAMES } from "@/constants/api"
import { db } from "@/constants/db"
import { getGameRef, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: [
    "Game",
    "GameList",
    "GameCount",
    "GameSphericalCount",
    "GameSphericals",
    "GameMapCount",
    "GameMaps",
    "GameFlatCount",
  ],
  endpoints: (builder) => ({
    getGamesEntity: builder.infiniteQuery<
      GameEntity[],
      void,
      { limit?: number, startAfter?: string }
    >({
      queryFn: async ({ pageParam }, { dispatch }) => {
        try {
          const definedFieldsConstraints: QueryConstraint[] = []

          definedFieldsConstraints.push(orderBy(documentId()))

          if (pageParam.startAfter) {
            definedFieldsConstraints.push(startAfter(pageParam.startAfter))
          }

          if (pageParam.limit)
            definedFieldsConstraints.push(limit(pageParam.limit))

          const q = query(
            TABLE_REFS[TABLES.GAMES],
            ...definedFieldsConstraints,
          )

          const snapshot = await getDocs(q)

          const games = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const sphericalsCount = await dispatch(
                gameApi.endpoints.getGameSphericalCount.initiate({
                  id: doc.id,
                }),
              ).unwrap()

              const mapsCount = await dispatch(
                gameApi.endpoints.getMapsCountByGameId.initiate({
                  gameId: doc.id,
                }),
              ).unwrap()

              const flatsCount = await dispatch(
                gameApi.endpoints.getFlatsCountByGameId.initiate({
                  gameId: doc.id,
                }),
              ).unwrap()

              const { data, error } = gameEntitySchema.safeParse({
                id: doc.id,
                ...doc.data(),
                sphericalsCount,
                mapsCount,
                flatsCount
              })

              if (error) throw new Error("Data parsing error")

              return data
            }),
          )

          return { data: games }
        } catch (error) {
          console.error("Error fetching games:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_GAMES,
          startAfter: "",
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastGame = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_GAMES

          // No more pages if the last page has fewer items than the limit
          if (!lastPage || lastPage.length < limitValue) {
            return undefined
          }

          return {
            startAfter: lastGame?.id,
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "Game" as const, id })),
          { type: "GameList" as const },
        ] : [{ type: "GameList" as const }],
    }),
    getGameById: builder.query<GameDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getGameRef(id))

          if (!docSnap.exists()) {
            throw new Error("Spherical not found")
          }

          const { data, error } = gameDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching game by ID:", error)
          toast.error(`Error fetching game data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Game", id }],
    }),
    getAllGames: builder.query<GameDocWithId[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.GAMES], orderBy(documentId())),
          )

          const games = snapshot.docs
            .map((doc) => {
              const { data, error } = gameDocWithIdSchema.safeParse({
                id: doc.id,
                ...doc.data(),
              })

              if (error) return null

              return { id: data.id, title: data.title }
            })
            .filter((g) => g !== null)

          const data = gameDocWithIdSchema.array().parse(games)

          return { data }
        } catch (error) {
          console.error("Error fetching games:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    }),
    getTotalGamesCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const coll = collection(db, TABLES.GAMES)
          const snapshot = await getCountFromServer(coll)

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching games count:", error)
          toast.error("Error fetching games count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: [{ type: "GameCount" }],
    }),
    getGameSphericalCount: builder.query<number, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const snapshot = await getCountFromServer(
            TABLES_SUB_REFS[TABLES.SPHERICAL](id),
          )

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching game spherical count:", error)
          toast.error("Error fetching game spherical count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { id }) => [
        { type: "GameSphericalCount", id },
      ],
    }),
    getSphericalsByGameId: builder.query<
      SphericalDocWithId[],
      { gameId: string }
    >({
      queryFn: async ({ gameId }) => {
        try {
          const snapshot = await getDocs(
            TABLES_SUB_REFS[TABLES.SPHERICAL](gameId),
          )

          const sphericals = snapshot.docs
            .map((doc) => {
              const { data, error } = sphericalDocWithIdSchema.safeParse({
                id: doc.id,
                ...doc.data(),
              })

              if (error) return null

              return data
            })
            .filter((s) => s !== null)

          return { data: sphericals }
        } catch (error) {
          console.error("Error fetching game spherical count:", error)
          toast.error("Error fetching game spherical count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { gameId }) => [
        { type: "GameSphericals", id: gameId },
      ],
    }),
    getMapsCountByGameId: builder.query<number, { gameId: string }>({
      queryFn: async ({ gameId }) => {
        try {
          const snapshot = await getCountFromServer(
            TABLES_SUB_REFS[TABLES.MAPS](gameId),
          )

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching game maps count:", error)
          toast.error("Error fetching game maps count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { gameId }) => [
        { type: "GameMapCount", id: gameId },
      ],
    }),
    getMapsByGameId: builder.query<MapDocWithId[], { gameId: string }>({
      queryFn: async ({ gameId }) => {
        try {
          const snapshot = await getDocs(TABLES_SUB_REFS[TABLES.MAPS](gameId))

          const maps = snapshot.docs
            .map((doc) => {
              const { data, error } = mapDocWithIdSchema.safeParse({
                id: doc.id,
                ...doc.data(),
              })

              if (error) return null

              return data
            })
            .filter((m) => m !== null)

          return { data: maps }
        } catch (error) {
          console.error("Error fetching game maps:", error)
          toast.error("Error fetching game maps")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { gameId }) => [
        { type: "GameMaps", id: gameId },
      ],
    }),
    getFlatsCountByGameId: builder.query<number, { gameId: string }>({
      queryFn: async ({ gameId }) => {
        try {
          const snapshot = await getCountFromServer(
            TABLES_SUB_REFS[TABLES.FLAT](gameId),
          )

          return { data: snapshot.data().count }
        } catch (error) {
          console.error("Error fetching game flats count:", error)
          toast.error("Error fetching game flats count")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (_result, _error, { gameId }) => [
        { type: "GameFlatCount", id: gameId },
      ],
    }),
    createGame: builder.mutation<GameDocWithId, CreateGameInput>({
      queryFn: async (input) => {
        try {
          const now = Timestamp.now()
          const { data: validatedInput, error: validationError } =
            gameDocSchema.safeParse({
              ...input,
              createdAt: now,
              updatedAt: now,
            })

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const docRef = await addDoc(TABLE_REFS[TABLES.GAMES], validatedInput)

          const docSnap = await getDoc(docRef)

          const { data, error } = gameDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating game:", error)
          toast.error("Error creating game")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: [{ type: "GameList" }, { type: "GameCount" }],
    }),
    updateGameById: builder.mutation<
      GameDocWithId,
      { id: string, data: UpdateGameInput }
    >({
      queryFn: async ({ id, data: input }) => {
        try {
          const { data: validatedInput, error: validationError } =
            updateGameInputSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const gameRef = getGameRef(id)
          await updateDoc(gameRef, {
            ...validatedInput,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(gameRef)

          if (!docSnap.exists()) {
            throw new Error("Game not found")
          }

          const { data, error } = gameDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error updating game:", error)
          toast.error("Error updating game")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Game", id },
        { type: "GameList" },
      ],
    }),
    deleteGameById: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          await deleteDoc(getGameRef(id))

          return { data: null }
        } catch (error) {
          console.error("Error deleting game:", error)
          toast.error("Error deleting game")

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Game", id },
        { type: "GameList" },
        { type: "GameCount" },
        { type: "GameSphericalCount", id },
        { type: "GameSphericals", id },
      ],
    }),
  }),
})

export const {
  useGetGamesEntityInfiniteQuery,
  useGetGameByIdQuery,
  useGetTotalGamesCountQuery,
  useGetGameSphericalCountQuery,
  useGetSphericalsByGameIdQuery,
  useGetMapsByGameIdQuery,
  useGetFlatsCountByGameIdQuery,
  useCreateGameMutation,
  useUpdateGameByIdMutation,
  useDeleteGameByIdMutation,
  useGetAllGamesQuery,
} = gameApi
