// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_GAMES } from "@/constants/api"
import { db } from "@/constants/db"
import { getGameRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler, type GlobalError } from "@/utils/error"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { capitalizeFirstLetter, getImageUrl, TABLES } from "@repo/common"
import { gameDocWithIdSchema, type GameDocWithId } from "@repo/schemas"
import {
  collection,
  documentId,
  getCountFromServer,
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

export const gameApi = createApi({
  reducerPath: "gameApi",
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
            thumbnailUrl: getImageUrl(docSnap.data().thumbnailUrl),
          })

          if (error) throw new Error("Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error fetching game by ID:", error)
          toast.error(`Error fetching game data for id: ${id}`)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
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
    }),
  }),
})

export const {
  useGetGamesInfiniteQuery,
  useGetGameByIdQuery,
  useGetTotalGamesCountQuery,
} = gameApi
