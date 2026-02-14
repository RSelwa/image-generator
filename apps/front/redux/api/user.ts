import { getCountFromServer, Timestamp, updateDoc } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type UserDoc } from "@repo/schemas"
import { getUserRef, TABLE_REFS } from "@/constants/db-refs"
import { globalErrorHandler } from "@/utils/error"

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUsersCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const usersCount = await getCountFromServer(TABLE_REFS[TABLES.USERS])

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
      }
    })
  }),
})

export const { useUpdateUserDocMutation } = userApi
