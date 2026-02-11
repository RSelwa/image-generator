import { STORAGE_PATHS } from "@repo/common"
import z from "zod"

export const uploadImagePayloadSchema = z.object({
  file: z.instanceof(File, {
    error: "File is required",
  }),
  gameName: z.string().optional(),
  bucketPath: z.enum(STORAGE_PATHS, {
    error: "Invalid storage path",
  }),
})

export const applySeedPayload = z.object({
  lobbyId: z.string().min(1),
  seedId: z.string(),
})
