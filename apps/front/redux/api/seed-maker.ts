import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { type FlatDocWithId, type MapDocWithId, type Round, type SphericalDocWithId } from "@repo/schemas"
import { auth } from "@/constants/db"

type SeedMakerGame = {
  id: string
  title: string
  image: string
  alternateNames: string[]
}

type GameReadyData = {
  sphericals: SphericalDocWithId[]
  flats: FlatDocWithId[]
  maps: MapDocWithId[]
}

type CreateManualSeedInput = {
  name: string
  rounds: Round[]
}

export const seedMakerApi = createApi({
  reducerPath: "seedMakerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/seed-maker",
    prepareHeaders: async (headers) => {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      return headers
    },
  }),
  endpoints: (builder) => ({
    getSeedMakerGames: builder.query<SeedMakerGame[], void>({
      query: () => "/games",
      transformResponse: (response: { games: SeedMakerGame[] }) => response.games,
    }),
    getGameReadyData: builder.query<GameReadyData, { gameId: string }>({
      query: ({ gameId }) => `/games/${gameId}/ready-data`,
    }),
    createManualSeed: builder.mutation<{ seedId: string }, CreateManualSeedInput>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useGetSeedMakerGamesQuery,
  useLazyGetSeedMakerGamesQuery,
  useGetGameReadyDataQuery,
  useCreateManualSeedMutation,
} = seedMakerApi
