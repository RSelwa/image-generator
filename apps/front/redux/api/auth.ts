import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  type Unsubscribe,
} from "firebase/auth"
import { toast } from "sonner"
import { z } from "zod"
import { auth } from "@/constants/db"

type User = {
  id: string
  email: string
  name: string
}

export type AuthState = {
  pending: boolean
  user: User | null
  isSignedIn: boolean
}

export const defaultAuth: AuthState = {
  pending: true,
  user: null,
  isSignedIn: false,
}

export type ResultListenAuth = AuthState
export type QueryArgsListenAuth = void

const sendPasswordResetEmailSchema = z.email()

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    listenAuth: builder.query<ResultListenAuth, QueryArgsListenAuth>({
      keepUnusedDataFor: 10,
      queryFn: () => ({ data: defaultAuth }),
      providesTags: () => ["auth"],
      onCacheEntryAdded: async (
        _,
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved,
          dispatch,
          getState,
        },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded
          // dispatch(updateSessionStatus(SESSION_STATUS.LOADING))
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            // const sessionState = (getState() as RootState)
            // const token = (await auth.currentUser?.getIdToken()) || ""
            // dispatch(updateSessionStatus(status))
            // dispatch(populateAuthUser({ user, token }))
            // if (isSignedIn) {
            //   await dispatch(authApi.endpoints.updateAuth.initiate()).unwrap()
            // }
            // updateCachedData(() => ({ user, isSignedIn, pending: false }))
          })
        } catch (error) {
          // dispatch(updateSessionStatus(SESSION_STATUS.ERROR))
          console.error(error)
          throw new Error("Something went wrong with auth listener")
        }
        await cacheEntryRemoved
        unsubscribe && unsubscribe()
      },
    }),
    sendPasswordResetEmail: builder.mutation<
      null,
      z.infer<typeof sendPasswordResetEmailSchema>
    >({
      async queryFn(email) {
        try {
          const { data, error } = z.safeParse(
            sendPasswordResetEmailSchema,
            email,
          )
          if (!data || error) {
            console.error("Invalid email address for password reset:", email)

            toast.error("Invalid email address")

            return {
              error: {
                status: "CUSTOM_ERROR",
                data: "Invalid email address",
              },
            }
          }

          await sendPasswordResetEmail(auth, email)

          toast.success("Password reset email sent! Please check your inbox.")

          return { data: null }
        } catch (error) {
          console.error("Error sending password reset email:", error)

          return {
            error: {
              status: "CUSTOM_ERROR",
              data: "Failed to send password reset email",
            },
          }
        }
      },
    }),
  }),
})

export const { useListenAuthQuery, useSendPasswordResetEmailMutation } = authApi
