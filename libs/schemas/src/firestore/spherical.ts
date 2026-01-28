import { Timestamp } from "@firebase/firestore/lite"
import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { WITH_ID } from "~/zod"

export const sphericalDocSchema = z.object({
  gameRef: z.string(),
  mapId: z.string().nullish(),
  gameId: z.string(),
  image: z.string(),
  storageImage: z.string().nullish(),
  mosaics: z.array(z.string()).nullish(),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  status: z
    .enum(DOCUMENTS_STATUS)
    .optional()
    .default(DOCUMENTS_STATUS.NEED_VERIFICATION),
  isValid: z.boolean().optional().default(false),
})

export const sphericalDocWithIdSchema = z.object({
  ...sphericalDocSchema.shape,
  ...WITH_ID.shape,
})

export type SphericalDoc = z.infer<typeof sphericalDocSchema>
export type SphericalDocWithId = z.infer<typeof sphericalDocWithIdSchema>
