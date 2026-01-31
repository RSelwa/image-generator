import { type Timestamp } from "@firebase/firestore"
import z from "zod"

export const WITH_ID = z.object({
  id: z.string().min(1),
})

export function SchemaWithId<T extends z.ZodObject>(schema: T) {
  return schema.extend({
    id: z.string().min(1),
  })
}

// Custom Timestamp schema that works with both client (@firebase/firestore) and admin (firebase-admin/firestore) SDKs
const isTimestamp = (val: unknown): val is Timestamp =>
  val !== null &&
  typeof val === "object" &&
  "seconds" in val &&
  "nanoseconds" in val &&
  typeof (val as Timestamp).toDate === "function"

export const timestampSchema = z.custom<Timestamp>(isTimestamp, { message: "Invalid Timestamp" })
