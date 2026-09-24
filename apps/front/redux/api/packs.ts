import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { auth } from "@/constants/db"
import { API_ENDPOINTS } from "@/constants/mapping"
import { type OpenPackResponse, openPackResponseSchema } from "@/schemas/packs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const packsApi = createApi({
  reducerPath: "packsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["UserCards"],
  endpoints: (builder) => ({
    openPack: builder.mutation<OpenPackResponse, void>({
      queryFn: async () => {
        try {
          const token = await auth.currentUser?.getIdToken()

          if (!token) {
            return {
              error: globalErrorHandler(
                new Error("No authenticated user found"),
              ),
            }
          }

          const response = await fetch(API_ENDPOINTS.OPEN_PACK, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            return {
              error: globalErrorHandler(
                new Error(`Failed to open a pack: ${await response.text()}`),
              ),
            }
          }

          return {
            data: openPackResponseSchema.parse(await response.json()),
          }
        } catch (error) {
          console.error("Error opening a pack", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, error) => (error ? [] : ["UserCards"]),
    }),
  }),
})

export const { useOpenPackMutation } = packsApi
