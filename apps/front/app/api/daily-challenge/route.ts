import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import z from "zod"

export const createSeedPayload = z.object({
  date: z.string(),
})

// app/api/create-seed/route.ts
export const POST = async (request: Request) => {
  try {
    const body = await request.json()

    const parsed = createSeedPayload.safeParse(body)

    if (!parsed.success) {
      return new Response("Invalid payload", { status: 400 })
    }

    const dailyChallenge = await refs[TABLES.DAILY_CHALLENGES].doc(parsed.data.date).get()

    if (!dailyChallenge.exists) {
      return new Response("Daily Challenge not found", { status: 404 })
    }

    const dailyChallengeData = dailyChallenge.data()

    return Response.json({
      dailyChallenge: dailyChallengeData,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating seed:", error.message)

      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
