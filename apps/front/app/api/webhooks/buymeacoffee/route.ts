import { DONOR_TIERS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import z from "zod"
import { createCoupon } from "@/app/api/webhooks/buymeacoffee/create-coupon"
import { payloadSchema } from "@/app/api/webhooks/buymeacoffee/schema"
import { MEMBERSHIPS_EVENTS, MEMBERSHIPS_ID } from "@/constants/mapping"

export const POST = async (request: Request) => {
  try {
    console.info(request.headers)

    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    console.info(token)

    if (token !== process.env.BMC_WEBHOOK_SECRET) {
      console.info("Unauthorized")

      return new Response("Unauthorized", { status: 401 })
    }

    const p = (await request.json())

    const parsedPayload = payloadSchema.safeParse(p)

    if (!parsedPayload.success) {
      console.error("Invalid payload:", parsedPayload.error)

      return new Response("Bad Request", { status: 400 })
    }

    const payload = parsedPayload.data
    const { type, data: { supporter_email } } = payload

    if (type === MEMBERSHIPS_EVENTS.CANCELLED) {
      return new Response("OK", { status: 200 })
    }

    const userSnapshot = await refs[TABLES.USERS].where("email", "==", supporter_email).limit(1).get()
    const userDoc = userSnapshot.docs?.[0]

    const newTier = Object.entries(MEMBERSHIPS_ID).find(([_, id]) => id === payload.data.membership_level_id)?.[0]

    const parsedTier = z.enum(DONOR_TIERS).safeParse(newTier)

    if (!parsedTier.success) {
      console.error("Unknown membership level ID:", payload.data.membership_level_id)

      return new Response("Bad Request", { status: 400 })
    }

    if (userSnapshot.empty || !userDoc) {
      await createCoupon(supporter_email, parsedTier.data)

      console.info(`No user found with email ${supporter_email}, coupon created`)

      return new Response("OK", { status: 200 })
    }

    if (!newTier) {
      console.error("Unknown membership level ID:", payload.data.membership_level_id)

      return new Response("Bad Request", { status: 400 })
    }

    await refs[TABLES.USERS].doc(userDoc.id).update({ donorTier: parsedTier.data })

    console.info(`User ${userDoc.id} updated with new donor tier: ${parsedTier.data}`)

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Error in bmc-webhook:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
