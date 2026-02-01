import { DIFFICULTIES, DOCUMENTS_STATUS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/index"

export const flatDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  gameId: z.string(),
  image: z.string().optional().default(""),
  difficulty: z.enum(DIFFICULTIES).optional().default(DIFFICULTIES.EASY),
  status: z
    .enum(DOCUMENTS_STATUS)
    .optional()
    .default(DOCUMENTS_STATUS.WAITING),
  thumbnail: z.string().optional(),

})

export const sphericalDocWithIdSchema = z.object({ ...flatDocSchema.shape, ...WITH_ID.shape })

export type FlatDoc = z.infer<typeof flatDocSchema>
export type FlatDocWithId = z.infer<typeof sphericalDocWithIdSchema>
