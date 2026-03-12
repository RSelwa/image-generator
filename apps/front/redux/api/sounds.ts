import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { SOUND_STATUS, TABLES } from "@repo/common"
import { type SoundDoc, soundDocSchema, type SoundDocWithId, soundDocWithIdSchema } from "@repo/schemas"
import { addDoc, deleteDoc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc } from "firebase/firestore"
import { getSoundRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const soundsApi = createApi({
  reducerPath: "soundsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Sound", "SoundList"],
  endpoints: (builder) => ({
    getAllSounds: builder.query<SoundDocWithId[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.SOUNDS], orderBy("createdAt", "desc")),
          )

          const sounds = snapshot.docs
            .map((doc) => {
              const { data, error } = soundDocWithIdSchema.safeParse({
                id: doc.id,
                ...doc.data(),
              })

              if (error) {
                console.error(`Error parsing social with ID: ${doc.id}`, error)

                return null
              }

              return data
            })
            .filter((s) => s !== null)

          return { data: sounds }
        } catch (error) {
          console.error("Error fetching socials:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (result) =>
        result ? [
          ...result.map(({ id }) => ({ type: "Sound" as const, id })),
          "SoundList",
        ] : ["SoundList"],
    }),
    getSoundById: builder.query<SoundDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getSoundRef(id))

          if (!docSnap.exists()) {
            throw new Error("Social not found")
          }

          const { data, error } = soundDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error fetching social with ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (_result, _error, { id }) => [{ type: "Sound", id }],
    }),
    createSound: builder.mutation<SoundDocWithId, Partial<SoundDoc>>({
      queryFn: async (input) => {
        try {
          const now = Timestamp.now()
          const { data: validatedInput, error: validationError } = soundDocSchema.safeParse(input)

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const docRef = await addDoc(TABLE_REFS[TABLES.SOUNDS], {
            ...validatedInput,
            status: SOUND_STATUS.DRAFT,
            createdAt: now,
            updatedAt: now,
          })

          const docSnap = await getDoc(docRef)

          const { data, error } = soundDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating social:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: ["SoundList"],
    }),
    updateSoundById: builder.mutation<SoundDocWithId, { id: string, data: Partial<SoundDoc> }>({
      queryFn: async ({ id, data: input }) => {
        try {
          const soundRef = getSoundRef(id)
          await updateDoc(soundRef, {
            ...input,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(soundRef)

          if (!docSnap.exists()) {
            throw new Error("Social not found")
          }

          const { data, error } = soundDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error updating social with ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Sound", id },
        "SoundList",
      ],
    }),
    deleteSoundById: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          await deleteDoc(getSoundRef(id))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting social with ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Sound", id },
        "SoundList",
      ],
    }),
  }),
})

export const { useGetAllSoundsQuery, useGetSoundByIdQuery, useCreateSoundMutation, useUpdateSoundByIdMutation, useDeleteSoundByIdMutation } = soundsApi
