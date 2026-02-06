import { getDoc } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { seedDocWithIdSchema } from "@repo/schemas"
import { getSeedRef } from "@/constants/db-refs"
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
          console.error("Error fetching lobby by ID:", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    })
  }),
})

export const { useGetSeedByIdQuery } = seedApi
