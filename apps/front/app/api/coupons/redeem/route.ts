import { DONOR_TIERS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { auth } from "@repo/providers/firebase"
import { FieldValue, Timestamp } from "firebase-admin/firestore"

type DonorTier = (typeof DONOR_TIERS)[keyof typeof DONOR_TIERS]

const TIER_RANK: Record<DonorTier, number> = {
  [DONOR_TIERS.BRONZE]: 1,
  [DONOR_TIERS.SILVER]: 2,
  [DONOR_TIERS.GOLD]: 3,
}

const getHigherTier = (a: DonorTier | null | undefined, b: DonorTier): DonorTier =>
  !a || TIER_RANK[b] > TIER_RANK[a] ? b : a

export const POST = async (request: Request) => {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return new Response("You need to be logged", { status: 401 })

    const decoded = await auth.verifyIdToken(token)

    const body = await request.json()
    const { code } = body as { code: string }

    if (!code || typeof code !== "string") {
      return new Response("A coupon code is required", { status: 400 })
    }

    const snapshot = await refs[TABLES.COUPONS]
      .where("code", "==", code.trim().toUpperCase())
      .limit(1)
      .get()

    if (snapshot.empty) return new Response("Coupon not found", { status: 404 })

    const couponDoc = snapshot.docs[0]
    const coupon = couponDoc.data()

    if (coupon.claimedBy) return new Response("Coupon already claimed", { status: 409 })

    if (coupon.expiresAt && coupon.expiresAt.toMillis() < Timestamp.now().toMillis()) {
      return new Response("Coupon has expired", { status: 410 })
    }

    const userRef = refs[TABLES.USERS].doc(decoded.uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) return new Response("User not found", { status: 404 })

    const currentTier = userDoc.data()?.donorTier as DonorTier | null
    const newTier = getHigherTier(currentTier, coupon.tier as DonorTier)

    await Promise.all([
      userRef.update({ donorTier: newTier, updatedAt: FieldValue.serverTimestamp() }),
      couponDoc.ref.update({ claimedBy: decoded.uid, claimedAt: FieldValue.serverTimestamp() }),
    ])

    return Response.json({ tier: newTier })
  } catch (error) {
    console.error("Error in redeem-coupon:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
