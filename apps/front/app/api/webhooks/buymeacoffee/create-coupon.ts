import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { type ConstantValues, type DONOR_TIERS } from "@repo/common"
import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type CouponDoc } from "@repo/schemas"
import { couponSchema } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"

const generateCode = (): string =>
  Math.random().toString(36).substring(2, 6).toUpperCase() +
  Math.random().toString(36).substring(2, 6).toUpperCase()

export const createCoupon = async (email: string, tier: ConstantValues<typeof DONOR_TIERS>) => {
  const dateInMonth = new Date()
  dateInMonth.setDate(dateInMonth.getDate() + 30)
  const timestampInMonth = Timestamp.fromDate(dateInMonth)

  const rawData: Partial<CouponDoc> = {
    code: generateCode(),
    bmcEmail: email,
    tier,
    createdAt: Timestamp.now() as unknown as ClientTimestamp,
    expiresAt: timestampInMonth as unknown as ClientTimestamp, // expires in 30 days
  }

  const { data, success, error } = couponSchema.safeParse(rawData)

  if (!success) {
    console.error("Invalid coupon data:", error)
    throw new Error("Invalid coupon data")
  }

  await refs[TABLES.COUPONS].add(data)
}
