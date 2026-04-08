import { addDoc, deleteDoc, onSnapshot, query, serverTimestamp, type Unsubscribe, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type MessageDoc, type MessageDocWithId, messageDocWithIdSchema } from "@repo/schemas"
import { getMessageRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const messagesApi = createApi({
  reducerPath: "messagesApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Message"],
  endpoints: (builder) => ({
    createMessage: builder.mutation<MessageDocWithId, Omit<MessageDoc, "seenBy" | "createdAt">>({
      queryFn: async (input) => {
        try {
          const docRef = await addDoc(TABLE_REFS[TABLES.MESSAGES], {
            ...input,
            seenBy: [],
            createdAt: serverTimestamp(),
          })

          return { data: { ...input, id: docRef.id, seenBy: [], createdAt: null } }
        } catch (error) {
          console.error("Error creating message:", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    deleteMessage: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          await deleteDoc(getMessageRef(id))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting message ${id}:`, error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    markMessageSeen: builder.mutation<null, { id: string; uid: string }>({
      queryFn: async ({ id, uid }) => {
        try {
          const ref = getMessageRef(id)
          await updateDoc(ref, { seenBy: [uid] })

          return { data: null }
        } catch (error) {
          console.error(`Error marking message ${id} as seen:`, error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),
    subscribeLobbyMessages: builder.query<MessageDocWithId[], { lobbyId: string }>({
      queryFn: () => ({ data: [] }),
      onCacheEntryAdded: async (
        { lobbyId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const q = query(
            TABLE_REFS[TABLES.MESSAGES],
            where("targetId", "==", lobbyId),
            where("targetType", "==", "lobby"),
          )

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const messages: MessageDocWithId[] = []

              for (const docSnap of snapshot.docs) {
                const { data, error } = messageDocWithIdSchema.safeParse({
                  id: docSnap.id,
                  ...docSnap.data(),
                })

                if (error) {
                  console.error("Error parsing lobby message:", error)
                  continue
                }

                messages.push(data)
              }

              updateCachedData(() => messages)
            },
            (error) => {
              console.error("Error in lobby messages snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up lobby messages listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),
    subscribeUserMessages: builder.query<MessageDocWithId[], { uid: string }>({
      queryFn: () => ({ data: [] }),
      onCacheEntryAdded: async (
        { uid },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const q = query(
            TABLE_REFS[TABLES.MESSAGES],
            where("targetId", "==", uid),
            where("targetType", "==", "user"),
          )

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const messages: MessageDocWithId[] = []

              for (const docSnap of snapshot.docs) {
                const { data, error } = messageDocWithIdSchema.safeParse({
                  id: docSnap.id,
                  ...docSnap.data(),
                })

                if (error) {
                  console.error("Error parsing message:", error)
                  continue
                }

                messages.push(data)
              }

              updateCachedData(() => messages)
            },
            (error) => {
              console.error("Error in messages snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up messages listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),
  }),
})

export const {
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useMarkMessageSeenMutation,
  useSubscribeUserMessagesQuery,
  useSubscribeLobbyMessagesQuery,
} = messagesApi
