import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { auth } from "@repo/providers/firebase"
import { seedDocSchema } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"

export const POST = async (request: Request) => {
  try {
    const headers = request.headers

    let userId: string | null = null
    const authHeader = headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (token) {
      const verifiedToken = await auth.verifyIdToken(token || "").catch((error) => {
        console.error("Token verification failed:", error)
      })

      userId = verifiedToken?.uid || null
    }

    const body = await request.json()

    const data = {
      name: body.name || "",
      rounds: body.rounds,
      createdBy: userId,
      timesUsed: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const parsed = seedDocSchema.safeParse(data)

    if (!parsed.success) {
      console.error("Failed to validate seed:", parsed.error)

      return new Response(`Invalid seed data: ${parsed.error}`, { status: 400 })
    }

    const seedRef = await refs[TABLES.SEEDS].add(parsed.data)

    return Response.json({ seedId: seedRef.id })
  } catch (error) {
    console.error("Error creating manual seed:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
