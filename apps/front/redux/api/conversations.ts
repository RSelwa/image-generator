import { addDoc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, type Unsubscribe, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type ConversationDoc, type ConversationDocWithId, conversationDocWithIdSchema, type ConversationMessageDoc, type ConversationMessageDocWithId, conversationMessageDocWithIdSchema } from "@repo/schemas"
import { getConversationRef, getLobbyConversationId, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

const isSameConversation = (conversation: ConversationDoc, participants: string[]) => {
  const conversationParticipants = [...new Set(conversation.participants)]

  return !conversation.lobbyId &&
    conversationParticipants.length === participants.length &&
    participants.every((participant) => conversationParticipants.includes(participant))
}

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Conversation"],
  endpoints: (builder) => ({
    findOrCreateConversation: builder.mutation<ConversationDocWithId, { uid: string, otherUid: string }>({
      queryFn: async ({ uid, otherUid }) => {
        try {
          const participants = [...new Set([uid, otherUid])]
          const q = query(
            TABLE_REFS[TABLES.CONVERSATIONS],
            where("participants", "array-contains", uid),
          )
          const snapshot = await getDocs(q)
          const existing = snapshot.docs.find((docSnap) => isSameConversation(docSnap.data(), participants))

          if (existing) {
            const { data, error } = conversationDocWithIdSchema.safeParse({ id: existing.id, ...existing.data() })
            if (error) return { error: globalErrorHandler(error) }

            return { data }
          }

          const docData: ConversationDoc = {
            participants,
            lastMessage: "",
            lastMessageAt: null,
            lastReadAt: {},
            createdAt: null,
          }
          const docRef = await addDoc(TABLE_REFS[TABLES.CONVERSATIONS], {
            ...docData,
            createdAt: serverTimestamp(),
          })

          return { data: { ...docData, id: docRef.id } }
        } catch (error) {
          console.error("Error finding or creating conversation:", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),

    findOrCreateLobbyConversation: builder.mutation<ConversationDocWithId, { lobbyId: string, adminUid: string }>({
      queryFn: async ({ lobbyId, adminUid }) => {
        try {
          const conversationId = getLobbyConversationId(lobbyId)
          const ref = getConversationRef(conversationId)
          const snapshot = await getDoc(ref)

          if (snapshot.exists()) {
            const { data, error } = conversationDocWithIdSchema.safeParse({ id: snapshot.id, ...snapshot.data() })
            if (error) return { error: globalErrorHandler(error) }

            return { data }
          }

          const docData: ConversationDoc = {
            participants: [adminUid],
            lastMessage: "",
            lastMessageAt: null,
            lastReadAt: {},
            createdAt: null,
            lobbyId,
          }
          await setDoc(ref, { ...docData, createdAt: serverTimestamp() })

          return { data: { ...docData, id: conversationId } }
        } catch (error) {
          console.error("Error finding or creating lobby conversation:", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),

    sendConversationMessage: builder.mutation<
      ConversationMessageDocWithId,
      { conversationId: string, content: string, senderId: string }
    >({
      queryFn: async ({ conversationId, content, senderId }) => {
        try {
          const messageData: ConversationMessageDoc = {
            content,
            senderId,
            createdAt: null,
          }
          const docRef = await addDoc(TABLES_SUB_REFS[TABLES.CONVERSATION_MESSAGES](conversationId), {
            ...messageData,
            createdAt: serverTimestamp(),
          })

          await updateDoc(getConversationRef(conversationId), {
            lastMessage: content,
            lastMessageAt: serverTimestamp(),
          })

          return { data: { ...messageData, id: docRef.id } }
        } catch (error) {
          console.error("Error sending conversation message:", error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),

    markConversationRead: builder.mutation<null, { conversationId: string, uid: string }>({
      queryFn: async ({ conversationId, uid }) => {
        try {
          await updateDoc(getConversationRef(conversationId), { [`lastReadAt.${uid}`]: serverTimestamp() })

          return { data: null }
        } catch (error) {
          console.error(`Error marking conversation ${conversationId} as read:`, error)

          return { error: globalErrorHandler(error) }
        }
      },
    }),

    subscribeConversation: builder.query<ConversationDocWithId | null, { conversationId: string }>({
      queryFn: () => ({ data: null }),
      onCacheEntryAdded: async (
        { conversationId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          unsubscribe = onSnapshot(
            getConversationRef(conversationId),
            (docSnap) => {
              if (!docSnap.exists()) {
                updateCachedData(() => null)

                return
              }

              const { data, error } = conversationDocWithIdSchema.safeParse({
                id: docSnap.id,
                ...docSnap.data(),
              })

              if (error) {
                console.error("Error parsing conversation:", error)

                return
              }

              updateCachedData(() => data)
            },
            (error) => {
              console.error("Error in conversation snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up conversation listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),

    subscribeConversations: builder.query<ConversationDocWithId[], { uid: string }>({
      queryFn: () => ({ data: [] }),
      onCacheEntryAdded: async (
        { uid },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const q = query(
            TABLE_REFS[TABLES.CONVERSATIONS],
            where("participants", "array-contains", uid),
          )

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const conversations: ConversationDocWithId[] = []

              for (const docSnap of snapshot.docs) {
                const { data, error } = conversationDocWithIdSchema.safeParse({
                  id: docSnap.id,
                  ...docSnap.data(),
                })

                if (error) {
                  console.error("Error parsing conversation:", error)
                  continue
                }

                conversations.push(data)
              }

              updateCachedData(() => conversations)
            },
            (error) => {
              console.error("Error in conversations snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up conversations listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),

    subscribeConversationMessages: builder.query<ConversationMessageDocWithId[], { conversationId: string }>({
      queryFn: () => ({ data: [] }),
      onCacheEntryAdded: async (
        { conversationId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) => {
        let unsubscribe: Unsubscribe | undefined

        try {
          await cacheDataLoaded

          const q = query(
            TABLES_SUB_REFS[TABLES.CONVERSATION_MESSAGES](conversationId),
            orderBy("createdAt", "asc"),
          )

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const messages: ConversationMessageDocWithId[] = []

              for (const docSnap of snapshot.docs) {
                const { data, error } = conversationMessageDocWithIdSchema.safeParse({
                  id: docSnap.id,
                  ...docSnap.data(),
                })

                if (error) {
                  console.error("Error parsing conversation message:", error)
                  continue
                }

                messages.push(data)
              }

              updateCachedData(() => messages)
            },
            (error) => {
              console.error("Error in conversation messages snapshot listener:", error)
            },
          )
        } catch (error) {
          console.error("Error setting up conversation messages listener:", error)
        }

        await cacheEntryRemoved
        unsubscribe?.()
      },
    }),
  }),
})

export const {
  useFindOrCreateConversationMutation,
  useFindOrCreateLobbyConversationMutation,
  useSendConversationMessageMutation,
  useMarkConversationReadMutation,
  useSubscribeConversationQuery,
  useSubscribeConversationsQuery,
  useSubscribeConversationMessagesQuery,
} = conversationsApi
