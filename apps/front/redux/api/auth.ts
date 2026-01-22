import { auth } from "@/constants/db"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { onAuthStateChanged, type Unsubscribe } from "firebase/auth"

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
  }),
})

export const { useListenAuthQuery } = authApi
