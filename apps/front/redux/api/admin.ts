// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_GAMES, DEFAULT_SIZE_SPHERICALS } from "@/constants/api"
import { getSphericalRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler, type GlobalError } from "@/utils/error"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { capitalizeFirstLetter, getImageUrl, TABLES } from "@repo/common"
import {
  gameDocWithIdSchema,
  sphericalDocWithIdSchema,
  type GameDocWithId,
  type SphericalDocWithId,
} from "@repo/schemas"
import {
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
} from "firebase/firestore"
import { toast } from "sonner"

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  endpoints: (builder) => ({
    getGames: builder.infiniteQuery<
      GameDocWithId[],
      { search?: string },
      { limit?: number; startAfter?: string }
    >({
      queryFn: async ({ pageParam, queryArg }) => {
        try {
          const definedFieldsConstraints: QueryConstraint[] = []
          const search = capitalizeFirstLetter(
            queryArg.search?.trim().toLowerCase(),
          )

          if (search) {
            // For search, order by title and use prefix matching
            definedFieldsConstraints.push(orderBy("title"))
            definedFieldsConstraints.push(where("title", ">=", search))
            definedFieldsConstraints.push(
              where("title", "<=", `${search}\uf8ff`),
            )
          } else {
            definedFieldsConstraints.push(orderBy(documentId()))
          }

          if (pageParam.startAfter) {
            definedFieldsConstraints.push(startAfter(pageParam.startAfter))
          }

          if (pageParam.limit)
            definedFieldsConstraints.push(limit(pageParam.limit))

          const q = query(TABLE_REFS[TABLES.GAMES], ...definedFieldsConstraints)

          const snapshot = await getDocs(q)

          const games = snapshot.docs.map((doc) => {
            const { data, error } = gameDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
              thumbnailUrl: getImageUrl(doc.data().thumbnailUrl),
            })

            if (error) throw new Error("Data parsing error")

            return data
          })

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

          return {
            startAfter: lastGame?.id,
            limit: limitValue,
          }
        },
      },
    }),
    getSpherical: builder.infiniteQuery<
      SphericalDocWithId[],
      void,
      { limit?: number; startAfter?: string }
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
            TABLE_REFS[TABLES.SPHERICAL],
            ...definedFieldsConstraints,
          )

          const snapshot = await getDocs(q)

          const spherical = snapshot.docs.map((doc) => {
            const { data, error } = sphericalDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
              image: getImageUrl(doc.data().image),
            })

            if (error) throw new Error("Data parsing error")

            return data
          })

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
    getSphericalById: builder.query<SphericalDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getSphericalRef(id))

          if (!docSnap.exists()) {
            throw new Error("Spherical not found")
          }

          const { data, error } = sphericalDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
            image: getImageUrl(docSnap.data().image),
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
  }),
})

export const {
  useGetGamesInfiniteQuery,
  useGetSphericalInfiniteQuery,
  useGetSphericalByIdQuery,
} = adminApi
