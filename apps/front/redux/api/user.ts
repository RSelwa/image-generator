import { documentId, getCountFromServer, getDoc, getDocs, limit, orderBy, query, type QueryConstraint, startAfter, Timestamp, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES, USERS_FIELDS } from "@repo/common"
import { type UserDoc, type userDocWithId, userDocWithIdSchema } from "@repo/schemas"
import { DEFAULT_SIZE_USERS } from "@/constants/api"
import { getUserRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

const ignoreAnonymousUsersConstraint: QueryConstraint = where(USERS_FIELDS.IS_ANONYMOUS_USER, "==", false)

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "UserList"],
  endpoints: (builder) => ({
    getUsers: builder.infiniteQuery<
      userDocWithId[],
      void,
      { limit?: number, startAfter?: string }
    >({
      queryFn: async ({ pageParam }) => {
        try {
          const constraints: QueryConstraint[] = [
            orderBy(documentId()),
            ignoreAnonymousUsersConstraint,
          ]

          if (pageParam.startAfter)
            constraints.push(startAfter(pageParam.startAfter))

          if (pageParam.limit)
            constraints.push(limit(pageParam.limit))

          const q = query(
            TABLE_REFS[TABLES.USERS],
            ...constraints,
          )
          const snapshot = await getDocs(q)

          const users: userDocWithId[] = []
          for (const docSnap of snapshot.docs) {
            const { data, error } = userDocWithIdSchema.safeParse({
              id: docSnap.id,
              ...docSnap.data(),
            })

            if (error) {
              console.error(`Error parsing user ${docSnap.id}:`, error)
              continue
            }

            users.push(data)
          }

          return { data: users }
        } catch (error) {
          console.error("Error fetching users:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      infiniteQueryOptions: {
        initialPageParam: {
          limit: DEFAULT_SIZE_USERS,
          startAfter: "",
        },
        getNextPageParam: (_, allPages, lastPageParams) => {
          const lastPage = allPages.at(-1)
          const lastUser = lastPage?.at(-1)

          const limitValue = lastPageParams?.limit || DEFAULT_SIZE_USERS

          if (!lastPage || lastPage.length < limitValue) {
            return undefined
          }

          return {
            startAfter: lastUser?.id,
            limit: limitValue,
          }
        },
      },
      providesTags: (result) =>
        result ? [
          ...result.pages
            .flat()
            .map(({ id }) => ({ type: "User" as const, id })),
          "UserList",
        ] : ["UserList"],
    }),
    getUsersCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const q = query(TABLE_REFS[TABLES.USERS], ignoreAnonymousUsersConstraint)
          const usersCount = await getCountFromServer(q)

          return { data: usersCount.data().count }
        } catch (error) {
          console.error("Error fetching users count", error)

          return {
            error: globalErrorHandler(error),
          }
        }
      }
    }),
    updateUserDoc: builder.mutation<null, { id: string, data: Partial<UserDoc> }>({
      queryFn: async ({ id, data }) => {
        try {
          const userRef = getUserRef(id)
          await updateDoc(userRef, {
            ...data,
            updatedAt: Timestamp.now(),
          })

          return { data: null }
        } catch (error) {
          console.error(`Error updating user doc with ID: ${id}`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
      },
      invalidatesTags: (_, error, { id }) =>
        error ? [] : [{ type: "User", id }, "UserList"],
    }),
    getUserById: builder.query<userDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getUserRef(id))

          if (!docSnap.exists()) {
            return { error: { status: 404, data: "User not found" } }
          }

          const { data, error } = userDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) {
            console.error(`Error parsing user with ID: ${id}`, error)
            return { error: { status: 500, data: "Data parsing error" } }
          }

          return { data }

      }
        catch (error) {
          console.error(`Error fetching user with ID: ${id}`, error)

          return {
            error: globalErrorHandler(error),
          }
        }
  }})
  }),
})

export const { useGetUsersInfiniteQuery, useUpdateUserDocMutation, useGetUsersCountQuery, useGetUserByIdQuery } = userApi
