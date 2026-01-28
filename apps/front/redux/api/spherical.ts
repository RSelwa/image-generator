// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_SPHERICALS } from "@/constants/api"
import { db } from "@/constants/db"
import { getSphericalRef, TABLE_REFS } from "@/constants/db-refs"
import { gameApi } from "@/redux/api/games"
import { globalErrorHandler, type GlobalError } from "@/utils/error"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { getIdFromFirestoreRef, getImageUrl, TABLES } from "@repo/common"
import { sphericalEntitySchema, type SphericalEntity } from "@repo/schemas"
import {
  collection,
  deleteDoc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  startAfter,
  type QueryConstraint,
} from "firebase/firestore"
import { toast } from "sonner"

export const sphericalApi = createApi({
  reducerPath: "sphericalApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  endpoints: (builder) => ({
    getSpherical: builder.infiniteQuery<
      SphericalEntity[],
      void,
      { limit?: number; startAfter?: string }
    >({
      queryFn: async ({ pageParam }, { dispatch }) => {
        try {
          const definedFieldsConstraints: QueryConstraint[] = []

          if (pageParam.startAfter) {
            definedFieldsConstraints.push(startAfter(pageParam.startAfter))
          }

          if (pageParam.limit)
            definedFieldsConstraints.push(limit(pageParam.limit))

          const q = query(
            TABLE_REFS[TABLES.SPHERICAL],
            ...definedFieldsConstraints,
          )

          const snapshot = await getDocs(q)

          const spherical = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const gameId = getIdFromFirestoreRef(doc.data().gameRef)

              const game = await dispatch(
                gameApi.endpoints.getGameById.initiate({
                  id: gameId,
                }),
              ).unwrap()

              const { data, error } = sphericalEntitySchema.safeParse({
                id: doc.id,
                ...doc.data(),
                image: getImageUrl(doc.data().image),
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
          startAfter: "",
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastGame = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_SPHERICALS

          return {
            startAfter: lastGame?.id,
            limit: limitValue,
          }
        },
      },
    }),
    getSphericalById: builder.query<
      SphericalEntity,
      { gameId: string; id: string }
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
            image: getImageUrl(docSnap.data().image),
            game,
          })

          if (error) throw new Error("Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching spherical by ID:", error)
          toast.error(`Error fetching spherical data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
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
    }),
    deleteSpherical: builder.mutation<null, { gameId: string; id: string }>({
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
    }),
  }),
})

export const {
  useGetSphericalInfiniteQuery,
  useGetSphericalByIdQuery,
  useDeleteSphericalMutation,
} = sphericalApi
