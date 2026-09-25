import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { CARD_TYPE, TABLES } from "@repo/common"
import {
  type CardDocWithId,
  cardDocWithIdSchema,
  type CardProperties,
} from "@repo/schemas"
import {
  addDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { getCardRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

type SaveMapCardInput = {
  card: CardDocWithId | undefined
  gameId: string
  mapId: string
  cardProperties: CardProperties | undefined
}

export const cardApi = createApi({
  reducerPath: "cardApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["CardList"],
  endpoints: (builder) => ({
    getCards: builder.query<CardDocWithId[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(TABLE_REFS[TABLES.CARDS])

          const cards = snapshot.docs.flatMap((doc) => {
            const { data, error } = cardDocWithIdSchema.safeParse({
              id: doc.id,
              ...doc.data(),
            })

            if (error) {
              console.error(`Error parsing card: ${doc.id}`, error)
              return []
            }

            return [data]
          })

          return { data: cards }
        } catch (error) {
          console.error("Error fetching cards:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: ["CardList"],
    }),
    saveMapCard: builder.mutation<null, SaveMapCardInput>({
      queryFn: async ({ card, gameId, mapId, cardProperties }) => {
        try {
          const now = Timestamp.now()

          if (!card) {
            if (cardProperties) {
              await addDoc(TABLE_REFS[TABLES.CARDS], {
                type: CARD_TYPE.MAP,
                gameId,
                mapId,
                cardProperties,
                createdAt: now,
                updatedAt: now,
              })
            }
            return { data: null }
          }

          if (!cardProperties) {
            await deleteDoc(getCardRef(card.id))
            return { data: null }
          }

          const isUnchanged =
            card.cardProperties.rarity === cardProperties.rarity &&
            card.cardProperties.number === cardProperties.number

          if (!isUnchanged) {
            await updateDoc(getCardRef(card.id), {
              cardProperties,
              updatedAt: now,
            })
          }

          return { data: null }
        } catch (error) {
          console.error("Error saving card:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["CardList"],
    }),
  }),
})

export const { useGetCardsQuery, useSaveMapCardMutation } = cardApi
