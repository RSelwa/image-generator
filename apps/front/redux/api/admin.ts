// Need to use the React-specific entry point to import createApi
import { TABLE_REFS } from "@/constants/db-refs"
import { getDocs } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { gameDocSchema } from "@repo/schemas"
import z from "zod"

const getGamesPayloadSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(50),
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
      queryFn: async (payload) => {
        try {
          const parsedPayload = getGamesPayloadSchema.safeParse(payload)
          if (!parsedPayload.success) {
            return { error: { status: 400, data: parsedPayload.error } }
          }

          const snapshot = await getDocs(TABLE_REFS[TABLES.GAMES])

          return { data: { total: snapshot.size, games: [] } }
        } catch (error) {
          return { error: { status: 500, data: "Internal Server Error" } }
        }
      },
    }),
  }),
})

export const { useGetGamesQuery } = adminApi
