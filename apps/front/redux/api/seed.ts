import { getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type SeedDocWithId, seedDocWithIdSchema } from "@repo/schemas"
import { getSeedRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

export const seedApi = createApi({
  reducerPath: "seedApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Seed"],
  endpoints: (builder) => ({
    getSeedById: builder.query({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getSeedRef(id))

          if (!docSnap.exists()) {
            throw new Error("Seed not found")
          }

          const { data, error } = seedDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching seed by ID: ${id}`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      providesTags: (result, error, arg) => [{ type: "Seed", id: arg.id }],
    }),
    getMySeeds: builder.query<SeedDocWithId[], { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const q = query(
            TABLE_REFS[TABLES.SEEDS],
            where("createdBy", "==", userId),
            orderBy("createdAt", "desc"),
          )
          const snapshot = await getDocs(q)

          const seeds: SeedDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = seedDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...docSnap.data(),
            })

            if (error) {
              console.error(`Error parsing seed ${docSnap.id}:`, error)
              continue
            }

            seeds.push(data)
          }

          return { data: seeds }
        } catch (error) {
          console.error("Error fetching user seeds:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    }),
    toggleFeaturedSeed: builder.mutation({
      queryFn: async ({ id, featured }, { dispatch }) => {
        try {
          const seedData = await dispatch(seedApi.endpoints.getSeedById.initiate({ id })).unwrap()

          if (!seedData) {
            throw new Error("Seed not found")
          }

          const updatedFeaturedAt = (seedData.featuredAt) ? null : serverTimestamp()

          await updateDoc(getSeedRef(id), {
            featuredAt: updatedFeaturedAt,
          })

          return { data: { id, featured } }
        } catch (error) {
          console.error(`Error toggling featured status for seed ${id}:`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (result, error, arg) => [{ type: "Seed", id: arg.id }],
    })
  }),
})

export const { useGetSeedByIdQuery, useGetMySeedsQuery, useToggleFeaturedSeedMutation } = seedApi
