import { region } from "@repo/providers/firebase"
import { https } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"
import z from "zod"
import { populateRaceSeed } from "~/populate-race-seed"

const populateRaceSeedPayloadSchema = z.object({
  seedId: z.string().min(1),
  playerCurrentIndex: z.number().min(0),
})

export const populate_race_seed = https.onCall<z.infer<typeof populateRaceSeedPayloadSchema>>(
  { region: region as string, cors: "*" },
  async ({ auth, data }) => {
    try {
      if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      const parsed = populateRaceSeedPayloadSchema.safeParse(data)

      if (!parsed.success) {
        throw new HttpsError("invalid-argument", "Invalid payload")
      }

      const result = await populateRaceSeed(parsed.data.seedId, parsed.data.playerCurrentIndex)

      if (!result) {
        throw new HttpsError("not-found", "Marathon seed not found")
      }

      return { rounds: result.rounds.length }
    } catch (error) {
      if (error instanceof HttpsError) throw error

      if (error instanceof Error) throw new HttpsError("internal", error.message)

      throw new HttpsError("cancelled", "Request was cancelled")
    }
  },
)
