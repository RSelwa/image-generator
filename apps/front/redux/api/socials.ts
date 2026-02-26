import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { getRandomHook, SOCIALS_STATUS, TABLES } from "@repo/common"
import { type SocialDoc, socialDocSchema, type SocialDocWithId, socialDocWithIdSchema } from "@repo/schemas"
import { addDoc, deleteDoc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc } from "firebase/firestore"
import { getSocialRef, TABLE_REFS } from "@/constants/db-refs"
import { type GlobalError, globalErrorHandler } from "@/utils/error"

export const socialsApi = createApi({
  reducerPath: "socialsApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  tagTypes: ["Social", "SocialList"],
  endpoints: (builder) => ({
    getAllSocials: builder.query<SocialDocWithId[], void>({
      queryFn: async () => {
        try {
          const snapshot = await getDocs(
            query(TABLE_REFS[TABLES.SOCIALS], orderBy("createdAt", "desc")),
          )

          const socials = snapshot.docs
            .map((doc) => {
              const { data, error } = socialDocWithIdSchema.safeParse({
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

          return { data: socials }
        } catch (error) {
          console.error("Error fetching socials:", error)

          return { error: globalErrorHandler(error) }
        }
      },
      providesTags: (result) =>
        result ? [
          ...result.map(({ id }) => ({ type: "Social" as const, id })),
          "SocialList",
        ] : ["SocialList"],
    }),
    getSocialById: builder.query<SocialDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const docSnap = await getDoc(getSocialRef(id))

          if (!docSnap.exists()) {
            throw new Error("Social not found")
          }

          const { data, error } = socialDocWithIdSchema.safeParse({
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
      providesTags: (_result, _error, { id }) => [{ type: "Social", id }],
    }),
    createSocial: builder.mutation<SocialDocWithId, Partial<SocialDoc>>({
      queryFn: async (input) => {
        try {
          const now = Timestamp.now()
          const { data: validatedInput, error: validationError } = socialDocSchema.safeParse({ ...input, status: SOCIALS_STATUS.WAITING_JOB_START })

          if (validationError) {
            throw new Error(validationError.message || "Validation error")
          }

          const docRef = await addDoc(TABLE_REFS[TABLES.SOCIALS], {
            ...validatedInput,
            createdAt: now,
            updatedAt: now,
          })

          const docSnap = await getDoc(docRef)

          const { data, error } = socialDocWithIdSchema.safeParse({
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
      invalidatesTags: ["SocialList"],
    }),
    updateSocialById: builder.mutation<SocialDocWithId, { id: string, data: Partial<SocialDoc> }>({
      queryFn: async ({ id, data: input }) => {
        try {
          const socialRef = getSocialRef(id)
          await updateDoc(socialRef, {
            ...input,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(socialRef)

          if (!docSnap.exists()) {
            throw new Error("Social not found")
          }

          const { data, error } = socialDocWithIdSchema.safeParse({
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
        { type: "Social", id },
        "SocialList",
      ],
    }),
    deleteSocialById: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          await deleteDoc(getSocialRef(id))

          return { data: null }
        } catch (error) {
          console.error(`Error deleting social with ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Social", id },
        "SocialList",
      ],
    }),
    retriggerPostProduction: builder.mutation<SocialDocWithId, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const socialRef = getSocialRef(id)

          await updateDoc(socialRef, {
            status: SOCIALS_STATUS.WAITING_CUSTOMIZATION,
            errorInfo: null,
            urlCustomizedVideoStorage: null,
            updatedAt: Timestamp.now(),
          })

          const docSnap = await getDoc(socialRef)

          if (!docSnap.exists()) {
            throw new Error("Social not found")
          }

          const { data, error } = socialDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error(`Error retriggering post production for social with ID: ${id}`, error)

          return { error: globalErrorHandler(error) }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Social", id },
        "SocialList",
      ],
    }),
    createSocialFromSphericalId: builder.mutation<SocialDocWithId, { sphericalId: string }>({
      queryFn: async ({ sphericalId }) => {
        try {
          const now = Timestamp.now()

          const hook = getRandomHook()
          const parsed = socialDocSchema.safeParse({
            sphericalId,
            status: SOCIALS_STATUS.WAITING_JOB_START,
            createdAt: now,
            updatedAt: now,
            hook
          })

          if (!parsed.success) {
            throw new Error(parsed.error.message || "Validation error")
          }

          const docRef = await addDoc(TABLE_REFS[TABLES.SOCIALS], parsed.data)

          const docSnap = await getDoc(docRef)

          const { data, error } = socialDocWithIdSchema.safeParse({
            id: docSnap.id,
            ...docSnap.data(),
          })

          if (error) throw new Error(error.message || "Data parsing error")

          return { data }
        } catch (error) {
          console.error("Error creating social from spherical ID:", error)

          return { error: globalErrorHandler(error) }
        }
      }
    })
  }),
})

export const {
  useGetAllSocialsQuery,
  useGetSocialByIdQuery,
  useCreateSocialMutation,
  useUpdateSocialByIdMutation,
  useDeleteSocialByIdMutation,
  useRetriggerPostProductionMutation
} = socialsApi
