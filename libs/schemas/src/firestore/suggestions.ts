import { SUGGESTIONS_TYPE } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const suggestionsDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  createdBy: z.string().optional(),
  gameId: z.string().nullish().default(null),
  flatId: z.string().nullish().default(null),
  sphericalId: z.string().nullish().default(null),
  type: z.enum(SUGGESTIONS_TYPE).nullish().default(null),
  title: z.string().nullish().default(null),
  message: z.string().nullish().default(null),
  imagesUrls: z.string().array().nullish().default([])
})

export const suggestionsDocWithIdSchema = z.object({
  ...suggestionsDocSchema.shape,
  ...WITH_ID.shape
})

export type SuggestionDoc = z.infer<typeof suggestionsDocSchema>
export type SuggestionDocWithId = z.infer<typeof suggestionsDocWithIdSchema>
