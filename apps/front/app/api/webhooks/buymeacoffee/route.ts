import { COUPON_EXPIRY_DAYS, DONOR_TIER_THRESHOLDS, DONOR_TIERS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { FieldValue, Timestamp } from "firebase-admin/firestore"

type DonorTier = (typeof DONOR_TIERS)[keyof typeof DONOR_TIERS]

const TIER_RANK: Record<DonorTier, number> = {
  [DONOR_TIERS.BRONZE]: 1,
  [DONOR_TIERS.SILVER]: 2,
  [DONOR_TIERS.GOLD]: 3,
}

const getTierFromCoffees = (coffees: number): DonorTier => {
  if (coffees >= DONOR_TIER_THRESHOLDS[DONOR_TIERS.GOLD]) return DONOR_TIERS.GOLD
  if (coffees >= DONOR_TIER_THRESHOLDS[DONOR_TIERS.SILVER]) return DONOR_TIERS.SILVER
  return DONOR_TIERS.BRONZE
}

const getHigherTier = (a: DonorTier | null | undefined, b: DonorTier): DonorTier =>
  !a || TIER_RANK[b] > TIER_RANK[a] ? b : a

const generateCode = (): string =>
  Math.random().toString(36).substring(2, 6).toUpperCase() +
  Math.random().toString(36).substring(2, 6).toUpperCase()

export const POST = async (request: Request) => {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (token !== process.env.BMC_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { type, response: payload } = (await request.json()) as {
      type: string
      response: {
        support_coffees: number
        support_email: string
        support_name: string
      }
    }

    if (type !== "coffee.purchased") {
      return new Response("OK", { status: 200 })
    }

    const { support_coffees, support_email, support_name } = payload
    const tier = getTierFromCoffees(support_coffees)

    const usersSnapshot = await refs[TABLES.USERS].where("email", "==", support_email).limit(1).get()

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0]
      const currentTier = userDoc.data().donorTier as DonorTier | null
      const newTier = getHigherTier(currentTier, tier)

      await userDoc.ref.update({ donorTier: newTier, updatedAt: FieldValue.serverTimestamp() })
      return Response.json({ matched: true, tier: newTier })
    }

    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    )

    const code = generateCode()
    await refs[TABLES.COUPONS].add({
      code,
      tier,
      bmcEmail: support_email,
      claimedBy: null,
      claimedAt: null,
      createdAt: Timestamp.now(),
      expiresAt,
    })

    console.info(`Coupon created for ${support_name} (${support_email}): ${code} [${tier}]`)
    return Response.json({ matched: false, code, tier })
  } catch (error) {
    console.error("Error in bmc-webhook:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
