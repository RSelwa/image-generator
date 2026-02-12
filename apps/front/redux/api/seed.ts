import { getDoc, getDocs, orderBy, query, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type SeedDocWithId, seedDocWithIdSchema } from "@repo/schemas"
import { getSeedRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

export const seedApi = createApi({
  reducerPath: "seedApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (_builder) => ({
    getSeedById: _builder.query({
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
      }
    }),
    getMySeeds: _builder.query<SeedDocWithId[], { userId: string }>({
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
  }),
})

export const { useGetSeedByIdQuery, useGetMySeedsQuery } = seedApi
