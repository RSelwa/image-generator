import { addDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, type Unsubscribe, updateDoc, where } from "@firebase/firestore"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { TABLES } from "@repo/common"
import { type ConversationDoc, type ConversationDocWithId, type ConversationMessageDoc, type ConversationMessageDocWithId, conversationDocWithIdSchema, conversationMessageDocWithIdSchema } from "@repo/schemas"
import { getConversationRef, TABLE_REFS, TABLES_SUB_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Conversation"],
  endpoints: (builder) => ({
    findOrCreateConversation: builder.mutation<ConversationDocWithId, { uid: string; otherUid: string }>({
      queryFn: async ({ uid, otherUid }) => {
        try {
          const q = query(
            TABLE_REFS[TABLES.CONVERSATIONS],
            where("participants", "array-contains", uid),
          )
          const snapshot = await getDocs(q)
          const existing = snapshot.docs.find((d) => d.data().participants.includes(otherUid))

          if (existing) {
            const { data, error } = conversationDocWithIdSchema.safeParse({ id: existing.id, ...existing.data() })
            if (error) return { error: globalErrorHandler(error) }
            return { data }
          }

          const docData: ConversationDoc = {
            participants: [uid, otherUid],
            lastMessage: "",
            lastMessageAt: null,
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

    findOrCreateLobbyConversation: builder.mutation<ConversationDocWithId, { lobbyId: string; adminUid: string }>({
      queryFn: async ({ lobbyId, adminUid }) => {
        try {
          const conversationId = `lobby_${lobbyId}`
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
      { conversationId: string; content: string; senderId: string }
    >({
      queryFn: async ({ conversationId, content, senderId }) => {
        try {
          const messageData: ConversationMessageDoc = {
            content,
            senderId,
            seenBy: [senderId],
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

    markConversationMessageSeen: builder.mutation<null, { conversationId: string; messageId: string; uid: string }>({
      queryFn: async ({ conversationId, messageId, uid }) => {
        try {
          const ref = doc(TABLES_SUB_REFS[TABLES.CONVERSATION_MESSAGES](conversationId), messageId)
          await updateDoc(ref, { seenBy: [uid] })
          return { data: null }
        } catch (error) {
          console.error(`Error marking conversation message ${messageId} as seen:`, error)
          return { error: globalErrorHandler(error) }
        }
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
  useMarkConversationMessageSeenMutation,
  useSubscribeConversationsQuery,
  useSubscribeConversationMessagesQuery,
} = conversationsApi
