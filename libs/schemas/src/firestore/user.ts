import { AVATARS_KEYS, DONOR_TIERS, getRandomAvatar, USERS_FIELDS } from "@repo/common"
import z from "zod"
import { dailyChallengeDateSchema } from "~/firestore/daily-challenge"
import { timestampSchema, WITH_ID } from "~/zod"

export const donorTierSchema = z.enum(DONOR_TIERS).nullish()

export const userDocSchema = z.object({
  email: z.email(),
  pseudo: z.string().min(3).max(30).nullish().default(""),
  createdAt: timestampSchema.nullish().default(() => null),
  updatedAt: timestampSchema.nullish().default(() => null),
  avatar: z.enum(AVATARS_KEYS).nullish().default(getRandomAvatar()),
  [USERS_FIELDS.IS_ANONYMOUS_USER]: z.boolean().nullish().default(false),
  streak: z.number().nullish().default(0),
  lastStreakDate: dailyChallengeDateSchema.nullish().default(null),
  maxStreak: z.number().nullish().default(0),
  bestRaceScore: z.number().nullish().default(0),
  bestDeathRunScore: z.number().nullish().default(0),
  donorTier: z.object(donorTierSchema).shape.default(null),
})

export const userDocWithIdSchema = z.object({
  ...userDocSchema.shape,
  ...WITH_ID.shape,
})

export type UserDoc = z.infer<typeof userDocSchema>
export type userDocWithId = z.infer<typeof userDocWithIdSchema>
export type DonorTier = z.infer<typeof donorTierSchema>
