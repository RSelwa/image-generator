import { Timestamp } from "@firebase/firestore"
import z from "zod"
// import { WITH_ID } from "./../zod.ts"
import { WITH_ID } from "~/zod"

export const mapDocSchema = z.object({
  title: z.string().min(1),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  imageUrl: z.string(),
})

export const mapDocWithIdSchema = z.object({
  ...mapDocSchema.shape,
  ...WITH_ID.shape,
})

export type MapDoc = z.infer<typeof mapDocSchema>
export type MapDocWithId = z.infer<typeof mapDocWithIdSchema>
