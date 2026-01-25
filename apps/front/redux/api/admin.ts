// Need to use the React-specific entry point to import createApi
import { DEFAULT_SIZE_GAMES } from "@/constants/api"
import { TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler, type GlobalError } from "@/utils/error"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { capitalizeFirstLetter, TABLES } from "@repo/common"
import { gameDocSchemaWithId } from "@repo/schemas"
import {
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
} from "firebase/firestore"
import z from "zod"

const getGamesResponseSchema = z.array(gameDocSchemaWithId)

type GetGamesResponse = z.infer<typeof getGamesResponseSchema>

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  endpoints: (builder) => ({
    getGames: builder.infiniteQuery<
      GetGamesResponse,
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
            const { data, error } = gameDocSchemaWithId.safeParse({
              id: doc.id,
              ...doc.data(),
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
  }),
})

export const { useGetGamesInfiniteQuery } = adminApi
