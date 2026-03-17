import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { type PayloadCreateDailyChallenge } from "@repo/schemas"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/constants/db"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const cloudFunctionsApi = createApi({
  reducerPath: "cloudFunctionsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Sound", "SoundList"],
  endpoints: (builder) => ({
    createDailyChallengeFunction: builder.mutation<null, PayloadCreateDailyChallenge>({
      queryFn: async (payload) => {
        try {
          await httpsCallable<PayloadCreateDailyChallenge, null>(functions, "create_daily_challenge")(payload)
          return { data: null }
        } catch (error) {
          console.error("Error creating daily challenge:", error)
          return { error: globalErrorHandler(error) }
        }
      },
    }),

    populateRaceSeed: builder.mutation<{ rounds: number }, { seedId: string; playerCurrentIndex: number }>({
      queryFn: async (payload) => {
        try {
          const result = await httpsCallable<{ seedId: string; playerCurrentIndex: number }, { rounds: number }>(
            functions,
            "populate_race_seed",
          )(payload)
          return { data: result.data }
        } catch (error) {
          console.error("Error populating race seed:", error)
          return { error: globalErrorHandler(error) }
        }
      },
    }),
  }),
})

export const { useCreateDailyChallengeFunctionMutation, usePopulateRaceSeedMutation } = cloudFunctionsApi
