import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { auth } from "@repo/providers/firebase"
// import { auth } from "@repo/providers/firebase"
import { seedDocSchema } from "@repo/schemas"
import { FieldValue } from "firebase-admin/firestore"
import { applySeedPayload } from "@/schemas/api"

export const POST = async (request: Request) => {
  try {
    const headers = request.headers

    const authHeader = headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return new Response("You need to be logged", { status: 401 })

    await auth.verifyIdToken(token || "")

    const body = await request.json()
    const parsed = applySeedPayload.safeParse(body)

    if (!parsed.success) {
      console.error("Invalid payload for applying seed:", parsed.error)

      return new Response(`Invalid payload: ${parsed.error}`, { status: 400 })
    }

    const seedSnapshot = await refs[TABLES.SEEDS].doc(parsed.data.seedId).get()

    if (!seedSnapshot.exists) {
      return new Response("Seed not found", { status: 404 })
    }

    const seedData = seedSnapshot.data()

    const parsedSeedData = seedDocSchema.safeParse(seedData)

    if (!parsedSeedData.success) {
      console.error("Invalid seed data in database:", parsedSeedData.error)

      return new Response(`Invalid seed data in database: ${parsedSeedData.error}`, { status: 500 })
    }

    const hasSpecialsRounds = parsedSeedData.data.rounds.some((round) => round.isSpecial)

    const seedUpdate: Record<string, unknown> = {
      seedId: parsed.data.seedId,
      "config.numberOfRounds": parsedSeedData.data.rounds.length,
      "config.hasSpecialRounds": hasSpecialsRounds,
    }

    if (parsedSeedData.data.mode) {
      seedUpdate["config.mode"] = parsedSeedData.data.mode
    }

    await refs[TABLES.LOBBIES].doc(parsed.data.lobbyId).update(seedUpdate)

    await refs[TABLES.SEEDS].doc(parsed.data.seedId).update({
      timesUsed: FieldValue.increment(1),
    })

    return new Response("Seed applied successfully", { status: 200 })
  } catch (error) {
    console.error("Error in leave-lobby:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
