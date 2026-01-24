import type { SignupSchema } from "@/components/signup-form"
import { auth } from "@/constants/db"
import { getUserRef } from "@/constants/db-refs"
import { SESSION_STATUS } from "@/constants/mapping"
import {
  updateSession,
  updateSessionAuthUser,
  updateSessionStatus,
} from "@/redux/session/session.actions"
import type { RootState } from "@/redux/store"
import { formatSessionFromFirebaseUser } from "@/utils/user"
import { type DocumentReference, getDoc, onSnapshot } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { isEqual } from "@repo/common"
import type { UserDoc } from "@repo/schemas"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type Unsubscribe,
} from "firebase/auth"
import { toast } from "sonner"
import { z } from "zod"

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

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile")

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    createUserAuth: builder.mutation<null, SignupSchema>({
      queryFn: async (data) => {
        try {
          await createUserWithEmailAndPassword(
            auth,
            data.email.toLowerCase(),
            data.password,
          )

          return { data: null }
        } catch (error) {
          console.log(error)
          toast.error("Failed to Signup. Please check your credentials.")

          return { error: error as unknown }
        }
      },
    }),
    loginWithGoogle: builder.mutation<null, void>({
      queryFn: async () => {
        try {
          await signInWithPopup(auth, googleProvider)

          return { data: null }
        } catch (error) {
          console.error(error)
          toast.error("Failed to login with Google.")

          return { error: error as unknown }
        }
      },
    }),
    listenAuth: builder.query<ResultListenAuth, QueryArgsListenAuth>({
      keepUnusedDataFor: 10,
      queryFn: () => ({ data: defaultAuth }),
      providesTags: () => ["auth"],
      onCacheEntryAdded: async (
        _,
        { cacheDataLoaded, cacheEntryRemoved, dispatch, getState },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded
          dispatch(updateSessionStatus(SESSION_STATUS.LOADING))

          unsubscribe = onAuthStateChanged(auth, async (user) => {
            const isSignedIn = !!user

            if (!user)
              await dispatch(
                updateSession({
                  authUser: null,
                  user: null,
                  status: SESSION_STATUS.SUCCESS,
                }),
              )

            if (isSignedIn) {
              await dispatch(authApi.endpoints.updateAuth.initiate()).unwrap()
            }
          })
        } catch (error) {
          dispatch(updateSessionStatus(SESSION_STATUS.ERROR))
          console.error(error)

          throw new Error("Something went wrong with auth listener")
        }

        await cacheEntryRemoved

        unsubscribe && unsubscribe()
      },
    }),
    login: builder.mutation<null, { email: string; password: string }>({
      queryFn: async (data) => {
        try {
          await signInWithEmailAndPassword(auth, data.email, data.password)

          return { data: null }
        } catch (error) {
          toast.error("Failed to login. Please check your credentials.")

          return { error: error as unknown }
        }
      },
    }),
    logout: builder.mutation<null, void>({
      queryFn: async () => {
        try {
          await auth.signOut()

          return { data: null }
        } catch (error) {
          return { error: error as unknown }
        }
      },
    }),
    updateAuth: builder.mutation<null, void>({
      queryFn: async (_, { dispatch }) => {
        try {
          const user = auth.currentUser

          if (!user) throw new Error("No user found")

          const token = await user.getIdToken()

          dispatch(updateSessionAuthUser(user))

          const payload = { ref: getUserRef(user.uid), token }

          await dispatch(authApi.endpoints.listenToUserDoc.initiate(payload))

          return { data: null }
        } catch (error) {
          return { error: error }
        }
      },
    }),
    listenToUserDoc: builder.query<
      UserDoc | null,
      { ref: DocumentReference<UserDoc> }
    >({
      queryFn: async ({ ref }, { dispatch, getState }) => {
        try {
          const authUser = (getState() as RootState)?.session.authUser

          if (!authUser) throw new Error("No authenticated user found")

          const promiseGetDoc = await getDoc(ref)
          if (!promiseGetDoc.exists()) throw new Error("Document not found")

          const userDocument = promiseGetDoc.data()

          const user = formatSessionFromFirebaseUser({
            user: userDocument,
            authUser,
          })

          dispatch(updateSession({ user, status: SESSION_STATUS.SUCCESS }))

          return { data: userDocument }
        } catch (error) {
          console.error("Error fetching user document:", error)

          return { data: null }
        }
      },
      onCacheEntryAdded: async (
        { ref }: { ref: DocumentReference<UserDoc> },
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
          const initialResult = await cacheDataLoaded

          if (!initialResult) return

          const authUser = (getState() as RootState)?.session.authUser

          if (!authUser) throw new Error("No authenticated user found")

          unsubscribe = onSnapshot(
            ref,
            async (snapshot) => {
              if (!snapshot.exists()) return unsubscribe?.()

              const data = { ...snapshot.data(), id: snapshot.id }

              const userDocument = data as UserDoc

              const user = formatSessionFromFirebaseUser({
                user: userDocument,
                authUser,
              })

              dispatch(updateSession({ user, status: SESSION_STATUS.SUCCESS }))

              updateCachedData((draft) => {
                const isSame = isEqual(draft, data)
                if (isSame) return draft

                return data
              })
            },
            (error) => {
              const state = getState() as RootState
              const userUid = state.session?.authUser?.uid

              if (!userUid) return unsubscribe?.()

              console.error("Error listening to user document:", error)
            },
          )
        } catch (error) {
          throw new Error(`Something went wrong with ${ref.path}`)
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

export const {
  useListenAuthQuery,
  useSendPasswordResetEmailMutation,
  useCreateUserAuthMutation,
  useLogoutMutation,
  useLoginMutation,
  useLoginWithGoogleMutation,
} = authApi
