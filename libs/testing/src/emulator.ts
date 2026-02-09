import { PROJECT_ID } from "@repo/common"

const AUTH_EMULATOR_URL = "http://localhost:9099"
const FIRESTORE_EMULATOR_URL = "http://localhost:8080"

export const createAuthUser = async (email: string, password: string) => {
  const response = await fetch(
    `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )
  const data = await response.json()

  return (data as unknown as any).localId as string
}

export type FirestoreFieldValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { nullValue: null }

export const toFirestoreFields = (
  obj: Record<string, unknown>,
): Record<string, FirestoreFieldValue> => {
  const fields: Record<string, FirestoreFieldValue> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      fields[key] = { stringValue: value }
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value }
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: String(value) }
      } else {
        fields[key] = { doubleValue: value }
      }
    } else if (value === null || value === undefined) {
      fields[key] = { nullValue: null }
    } else if (typeof value === "object" && "toDate" in value) {
      fields[key] = { timestampValue: (value as { toDate: () => Date }).toDate().toISOString() }
    }
  }
  return fields
}

export const createFirestoreDoc = async (
  collection: string,
  documentId: string,
  fields: Record<string, FirestoreFieldValue>,
) => {
  await fetch(
    `${FIRESTORE_EMULATOR_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?documentId=${documentId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    },
  )
}
