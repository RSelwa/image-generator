import type z from "zod"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { type payloadCreateDailyChallengeSchema } from "@repo/schemas"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/constants/db"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

type PayloadCreateDailyChallenge = z.infer<typeof payloadCreateDailyChallengeSchema>

export const cloudFunctionsApi = createApi({
  reducerPath: "cloudFunctionsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Sound", "SoundList"],
  endpoints: (builder) => ({
    createDailyChallengeFunction: builder.mutation<null, PayloadCreateDailyChallenge>({
      queryFn: async (payload) => {
        try {
          await httpsCallable <
            PayloadCreateDailyChallenge,
            null
          >
          (
            functions,
            "createDailyChallenge"
          )(payload)

          return { data: null }
        } catch (error) {
          console.error("Error creating daily challenge:", error)

          return { error: globalErrorHandler(error) }
        }
      }
    })
  })
})

export const { useCreateDailyChallengeFunctionMutation } = cloudFunctionsApi
