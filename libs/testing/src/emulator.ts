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

export const createFirestoreDoc = async (
  collection: string,
  documentId: string,
  fields: Record<string, { stringValue: string }>,
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
