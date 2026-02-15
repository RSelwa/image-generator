import { DEFAULT_NUMBERS_ROUNDS, TABLES } from "@repo/common"
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

// app/api/create-seed/route.ts
export const POST = async (request: Request) => {
  try {
    const body = await request.json()

    const parsed = createSeedPayload.safeParse(body)

    if (!parsed.success) {
      return new Response("Invalid payload", { status: 400 })
    }

    const rounds = await generateSeedRounds({ numberOfRounds: parsed.data.numberOfRounds, hasSpecialRounds: parsed.data.hasSpecialRounds })

    const data = {
      name: "",
      rounds,
      createdBy: null,
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
