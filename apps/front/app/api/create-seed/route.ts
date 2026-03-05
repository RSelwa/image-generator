import { DEFAULT_NUMBERS_ROUNDS, LOBBY_STATUS, MAX_RECENT_LOBBIES_TO_EXCLUDE, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { auth } from "@repo/providers/firebase"
import { seedDocSchema } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import z from "zod"
import { generateSeedRounds } from "@/libs/seed"

export const createSeedPayload = z.object({
  numberOfRounds: z.number().min(1).max(30).default(DEFAULT_NUMBERS_ROUNDS),
  hasSpecialRounds: z.boolean().default(false),
})

const getRecentlyPlayedGameIds = async (userId: string): Promise<string[]> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = Timestamp.fromDate(today)

  const recentLobbies = await refs[TABLES.LOBBIES]
    .where("playersIds", "array-contains", userId)
    .where("status", "==", LOBBY_STATUS.FINISHED)
    .where("createdAt", ">=", todayTimestamp)
    .orderBy("createdAt", "desc")
    .limit(MAX_RECENT_LOBBIES_TO_EXCLUDE)
    .get()

  if (recentLobbies.empty) return []

  const seedIds = recentLobbies.docs
    .map((doc) => doc.data()?.seedId)
    .filter((seedId): seedId is string => !!seedId)

  if (seedIds.length === 0) return []

  const seedDocs = await Promise.all(
    seedIds.map((seedId) => refs[TABLES.SEEDS].doc(seedId).get())
  )

  const gameIds: string[] = []

  for (const seedDoc of seedDocs) {
    if (!seedDoc.exists) continue

    const rounds = seedDoc.data()?.rounds || []

    for (const round of rounds) {
      if (round.gameId) {
        gameIds.push(round.gameId)
      }

      if (round.options) {
        for (const option of round.options) {
          if (option.gameId) {
            gameIds.push(option.gameId)
          }
        }
      }
    }
  }

  return [...new Set(gameIds)]
}

// app/api/create-seed/route.ts
export const POST = async (request: Request) => {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return new Response("You need to be logged", { status: 401 })

    const verifiedToken = await auth.verifyIdToken(token)
    const userId = verifiedToken.uid

    const body = await request.json()

    const parsed = createSeedPayload.safeParse(body)

    if (!parsed.success) {
      return new Response("Invalid payload", { status: 400 })
    }

    const recentlyPlayedGameIds = await getRecentlyPlayedGameIds(userId)

    const rounds = await generateSeedRounds({
      numberOfRounds: parsed.data.numberOfRounds,
      hasSpecialRounds: parsed.data.hasSpecialRounds,
      recentlyPlayedGameIds,
    })

    const data = {
      name: "",
      rounds,
      createdBy: userId,
      timesUsed: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    const newSeedDoc = seedDocSchema.safeParse(data)

    if (!newSeedDoc.success) {
      console.error("Failed to create seed doc:", newSeedDoc.error)

      return new Response(`Failed to create seed ${newSeedDoc.error}`, { status: 500 })
    }

    const seedWithId = await refs[TABLES.SEEDS].add(newSeedDoc.data)

    return Response.json({
      seedId: seedWithId.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating seed:", error.message)

      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
