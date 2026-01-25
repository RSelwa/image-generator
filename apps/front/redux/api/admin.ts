// Need to use the React-specific entry point to import createApi
import { TABLE_REFS } from "@/constants/db-refs"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { gameDocSchema } from "@repo/schemas"
import {
  type DocumentReference,
  getDocs,
  limit,
  query,
  type QueryConstraint,
  startAt,
} from "firebase/firestore"
import z from "zod"

const getGamesPayloadSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(50),
  startAt: z.custom<DocumentReference>(),
})
const getGamesResponseSchema = z.object({
  total: z.number().min(0),
  games: z.array(gameDocSchema),
  hasNextPage: z.boolean(),
})

type GetGamesPayload = z.infer<typeof getGamesPayloadSchema>
type GetGamesResponse = z.infer<typeof getGamesResponseSchema>

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getGames: builder.query<GetGamesResponse, GetGamesPayload>({
      query: async (payload) => {
        try {
          const parsedPayload = getGamesPayloadSchema.safeParse(payload)
          if (!parsedPayload.success)
            return {
              error: { status: 400, data: parsedPayload.error },
            }

          const definedFieldsConstraints: QueryConstraint[] = []

          if (parsedPayload.data.startAt) {
            definedFieldsConstraints.push(startAt(parsedPayload.data.startAt))
          }

          const q = query(
            TABLE_REFS[TABLES.GAMES],
            limit(parsedPayload.data.pageSize),
            ...definedFieldsConstraints,
          )

          const snapshot = await getDocs(q)

          const total = snapshot.size

          console.log(snapshot.docs[0])

          return {
            data: { total, games: [], hasNextPage: true },
          }
        } catch (error) {
          console.error("Error fetching games:", error)

          return {
            data: null,
            error: { status: 500, data: "Internal Server Error" },
          }
        }
      },
    }),
  }),
})

export const { useGetGamesQuery } = adminApi
