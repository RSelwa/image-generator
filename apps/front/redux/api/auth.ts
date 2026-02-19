import { type Action } from "@reduxjs/toolkit"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { generateUsername, getRandomAvatar, isEqual, PREFIX_ANONYMOUS_USER, SUFFIX_ANONYMOUS_USER } from "@repo/common"
import { type UserDoc } from "@repo/schemas"
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  type Unsubscribe,
} from "firebase/auth"
import { type DocumentReference, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { REHYDRATE } from "redux-persist"
import { toast } from "sonner"
import { z } from "zod"
import { type SignupSchema } from "@/components/signup-form"
import { auth } from "@/constants/db"
import { getRightRef, getUserRef } from "@/constants/db-refs"
import { FIREBASE_ERRORS, SESSION_STATUS } from "@/constants/mapping"
import {
  updateSession,
  updateSessionAuthUser,
  updateSessionStatus,
} from "@/redux/session/session.actions"
import { type RootState } from "@/redux/store"
import { formatSessionFromAnonymousUser, formatSessionFromFirebaseUser } from "@/utils/user"

const sendPasswordResetEmailSchema = z.email()

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile")

const isHydrateAction = (action: Action): action is Action<typeof REHYDRATE> & {
  key: string
  payload: RootState
  err: unknown
} => {
  return action.type === REHYDRATE
}

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: fakeBaseQuery(),
  // to prevent circular type issues, the return type needs to be annotated as any
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      // when persisting the api reducer
      if (action.key === "key used with redux-persist") {
        return action.payload
      }

      // When persisting the root reducer
      return action.payload[reducerPath]
    }
  },
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    createUserAuth: builder.mutation<null, SignupSchema>({
      queryFn: async (data, { dispatch }) => {
        try {
          const email = data.email.toLowerCase()

          if (auth.currentUser?.isAnonymous) {
            try {
              const credential = EmailAuthProvider.credential(email, data.password)
              await linkWithCredential(auth.currentUser, credential)
              await updateDoc(getUserRef(auth.currentUser.uid), { email, isAnonymousUser: false,
               }).catch((error) => {
                console.error("Error updating user", auth.currentUser?.uid, error)
              })
              await dispatch(authApi.endpoints.updateAuth.initiate()).unwrap()
            } catch (linkError: unknown) {
              const firebaseError = linkError as { code?: string }
              if (firebaseError?.code === FIREBASE_ERRORS.EMAIL_ALREADY_USED) {
                toast.error("An account with this email already exists. Please log in instead.")

                return { data: null }
              }

              throw linkError
            }
          } else {
            await createUserWithEmailAndPassword(auth, email, data.password)
          }

          return { data: null }
        } catch (error) {
          console.error(error)
          toast.error("Failed to Signup. Please check your credentials.")

          return { error: error as unknown }
        }
      },
    }),
    loginWithGoogle: builder.mutation<null, void>({
      queryFn: async (_, { dispatch }) => {
        try {
          if (auth.currentUser?.isAnonymous) {
            try {
              const result = await linkWithPopup(auth.currentUser, googleProvider)
              const email = result.user.email
              if (email) {
                await updateDoc(getUserRef(auth.currentUser.uid), { email, pseudo: auth.currentUser.displayName, isAnonymousUser:false, avatar: getRandomAvatar() }).catch((error) => {
                  console.error("Error updating user", auth.currentUser?.uid, error)
                })
              }
              await dispatch(authApi.endpoints.updateAuth.initiate()).unwrap()
            } catch (linkError: unknown) {
              const firebaseError = linkError as { code?: string, customData?: unknown }
              if (firebaseError?.code === FIREBASE_ERRORS.EMAIL_ALREADY_USED) {
                toast.error("An account with this email already exists. Please log in instead.")

                return { data: null }
              }

              if (firebaseError?.code === FIREBASE_ERRORS.CREDENTIAL_ALREADY_IN_USE) {
                const credential = GoogleAuthProvider.credentialFromError(firebaseError as any)
                if (credential) {
                  await signInWithCredential(auth, credential)

                  return { data: null }
                }
              }

              throw linkError
            }
          } else {
            await signInWithPopup(auth, googleProvider)
          }

          return { data: null }
        } catch (error) {
          console.error(error)
          toast.error("Failed to login with Google.")

          return { error: error as unknown }
        }
      },
    }),
    listenAuth: builder.query<null, void>({
      keepUnusedDataFor: 10,
      queryFn: () => ({ data: null }),
      providesTags: () => ["auth"],
      onCacheEntryAdded: async (
        _,
        { cacheDataLoaded, cacheEntryRemoved, dispatch },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded
          dispatch(updateSessionStatus(SESSION_STATUS.LOADING))

          unsubscribe = onAuthStateChanged(auth, async (user) => {
            const isSignedIn = !!user && !user.isAnonymous

            if (!user) {
              signInAnonymously(auth)

              return
            }

            if (user.isAnonymous) {
              // beforeUserCreated blocking function doesn't trigger for anonymous sign-ins,
              // so we create the user doc client-side if it doesn't exist
              const userRef = getUserRef(user.uid)
              const userDoc = await getDoc(userRef)
              const pseudo = generateUsername()
              
              if (!userDoc.exists()) {
                await setDoc(userRef, {
                  email: `${PREFIX_ANONYMOUS_USER}${user.uid}${SUFFIX_ANONYMOUS_USER}`,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  pseudo,
                  isAnonymousUser: true,
                  avatar: getRandomAvatar(),
                })
              }

              const sessionUser = formatSessionFromAnonymousUser({ authUser: user, pseudo: userDoc.data()?.pseudo || pseudo })

              dispatch(updateSession({
                authUser: user,
                user: sessionUser,
                status: SESSION_STATUS.SUCCESS,
              }))

              return
            }

            if (isSignedIn) await dispatch(authApi.endpoints.updateAuth.initiate()).unwrap()
          })
        } catch (error) {
          dispatch(updateSessionStatus(SESSION_STATUS.ERROR))
          console.error(error)

          throw new Error("Something went wrong with auth listener")
        }

        await cacheEntryRemoved

        unsubscribe?.()
      },
    }),
    login: builder.mutation<null, { email: string, password: string }>({
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

          dispatch(updateSessionAuthUser(user))

          const payload = { ref: getUserRef(user.uid) }

          await dispatch(authApi.endpoints.listenToUserDoc.initiate(payload))

          return { data: null }
        } catch (error) {
          return { error }
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

          const promiseGetUserDoc = await getDoc(ref)
          const getUserRight = await getDoc(getRightRef(authUser.uid))

          if (!promiseGetUserDoc.exists()) throw new Error("Document not found")

          const rightsDoc = getUserRight.exists() ? getUserRight.data() : null
          const userDocument = promiseGetUserDoc.data()

          const user = formatSessionFromFirebaseUser({
            user: userDocument,
            authUser,
            rightsDoc
          })

          dispatch(updateSession({ user, status: SESSION_STATUS.SUCCESS }))

          return { data: userDocument }
        } catch (error) {
          console.error("Error fetching user document:", error)
          dispatch(updateSessionStatus(SESSION_STATUS.ERROR))
          await auth.signOut()

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

          const getUserRight = await getDoc(getRightRef(authUser.uid))
          const rightsDoc = getUserRight.exists() ? getUserRight.data() : null

          unsubscribe = onSnapshot(
            ref,
            async (snapshot) => {
              if (!snapshot.exists()) return unsubscribe?.()

              try {
                const data = { ...snapshot.data(), id: snapshot.id }

                const userDocument = data as UserDoc

                const user = formatSessionFromFirebaseUser({
                  user: userDocument,
                  authUser,
                  rightsDoc
                })

                dispatch(updateSession({ user, status: SESSION_STATUS.SUCCESS }))

                updateCachedData((draft) => {
                  const isSame = isEqual(draft, data)
                  if (isSame) return draft

                  return data
                })
              } catch (error) {
                console.error("Error parsing user document:", error)
                dispatch(updateSessionStatus(SESSION_STATUS.ERROR))
                await auth.signOut()
              }
            },
            (error) => {
              const state = getState() as RootState
              const userUid = state.session?.authUser?.uid

              if (!userUid) return unsubscribe?.()

              console.error("Error listening to user document:", error)
            },
          )
        } catch (error) {
          console.error("Error in user document listener:", error)

          throw new Error(`Something went wrong with ${ref.path}`)
        }
        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),
    loginAnonymously: builder.mutation<null, void>({
      queryFn: async () => {
        try {
          await signInAnonymously(auth)

          return { data: null }
        } catch (error) {
          console.error(error)
          toast.error("Failed to sign in anonymously.")

          return { error: error as unknown }
        }
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
  useLoginAnonymouslyMutation,
} = authApi
