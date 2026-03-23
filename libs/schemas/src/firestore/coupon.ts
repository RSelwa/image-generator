import { DONOR_TIERS } from "@repo/common"
import z from "zod"
import { timestampSchema, WITH_ID } from "~/zod"

export const couponSchema = z.object({
  code: z.string().min(1),
  tier: z.enum(DONOR_TIERS),
  bmcEmail: z.string().min(1),
  claimedBy: z.string().nullish().default(null),
  claimedAt: timestampSchema.nullish().default(null),
  createdAt: timestampSchema.nullish().default(null),
  expiresAt: timestampSchema.nullish().default(null),
})

export const couponWithIdSchema = z.object({
  ...couponSchema.shape,
  ...WITH_ID.shape,
})

export type CouponDoc = z.infer<typeof couponSchema>
export type CouponWithId = z.infer<typeof couponWithIdSchema>
