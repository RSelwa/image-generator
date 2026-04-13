import { getDoc } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { flatDocWithIdSchema, mapDocWithIdSchema, type PublicPlayer, publicPlayerSchema, sphericalDocWithIdSchema } from "@repo/schemas"
import { getFlatRef, getMapRef, getSphericalRef, getUserRef } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

type GratitudeInput = {
  gameId: string
  sphericalId?: string | null
  flatId?: string | null
  mapId?: string | null
}

export const gratitudeApi = createApi({
  reducerPath: "gratitudeApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getGratitudePlayers: builder.query<PublicPlayer[], GratitudeInput>({
      queryFn: async ({ gameId, sphericalId, flatId, mapId }) => {
        try {
          const userIds = new Set<string>()

          if (sphericalId) {
            const snap = await getDoc(getSphericalRef(gameId, sphericalId))
            if (snap.exists()) {
              const { data } = sphericalDocWithIdSchema.safeParse({ id: snap.id, ...snap.data() })
              data?.gratitude?.forEach((id) => userIds.add(id))
            }
          }

          if (flatId) {
            const snap = await getDoc(getFlatRef(gameId, flatId))
            if (snap.exists()) {
              const { data } = flatDocWithIdSchema.safeParse({ id: snap.id, ...snap.data() })
              data?.gratitude?.forEach((id) => userIds.add(id))
            }
          }

          if (mapId) {
            const snap = await getDoc(getMapRef(gameId, mapId))
            if (snap.exists()) {
              const { data } = mapDocWithIdSchema.safeParse({ id: snap.id, ...snap.data() })
              data?.gratitude?.forEach((id) => userIds.add(id))
            }
          }

          if (!userIds.size) return { data: [] }

          const players: PublicPlayer[] = []

          await Promise.all(
            Array.from(userIds).map(async (id) => {
              const snap = await getDoc(getUserRef(id))
              if (!snap.exists()) return
              const { data } = publicPlayerSchema.safeParse({ id: snap.id, ...snap.data() })
              if (data) players.push(data)
            }),
          )

          return { data: players }
        } catch (error) {
          return { error: globalErrorHandler(error) }
        }
      },
    }),
  }),
})

export const { useGetGratitudePlayersQuery } = gratitudeApi
