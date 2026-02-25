import { SOCIALS_STATUS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const socialDocSchema = z.object({
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  errorInfo: z.string().nullish().default(null),

  youtubeLink: z.string().nullish().default(null),
  audioLink: z.string().nullish().default(null),
  hook: z.string().nullish().default(null),

  gameId: z.string().nullish().default(null),
  sphericalId: z.string().nullish().default(null),
  duration: z.number().nullish().default(null),
  status: z.enum(SOCIALS_STATUS).nullish().default(null),
  urlSphericalVideoStorage: z.string().nullish().default(null),
  urlCustomizedVideoStorage: z.string().nullish().default(null),

  urlTikTok: z.string().nullish().default(null),
  tiktokViews: z.number().nullish().default(null),
  tiktokLikes: z.number().nullish().default(null),

  urlInstagram: z.string().nullish().default(null),
  instagramViews: z.number().nullish().default(null),
  instagramLikes: z.number().nullish().default(null),
})

export const socialDocWithIdSchema = z.object({
  ...socialDocSchema.shape,
  ...WITH_ID.shape,
})

export type SocialDoc = z.infer<typeof socialDocSchema>
export type SocialDocWithId = z.infer<typeof socialDocWithIdSchema>
