import { faker } from "@faker-js/faker"
import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { beforeAll, describe, expect, it } from "vitest"

async function createAuthUser({
  email,
  password = "Test1234!",
}: {
  email: string
  password?: string
}) {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )

  const data = (await res.json()) as { localId: string, email: string }

  return { uid: data.localId, email: data.email }
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
  }
})

describe("createUserDocument", () => {
  beforeAll(async () => {
    // Only run destructive operations if using the Firestore emulator
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      const snapshotUsers = await refs.users.get()
      const batch = db.batch()
      snapshotUsers.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      // Delete all auth accounts in the emulator
      await fetch(
        "http://localhost:9099/emulator/v1/projects/tiktok-generator-fa261/accounts",
        { method: "DELETE" },
      )
    } else {
      throw new Error("Tests must be run against the Firestore emulator. Aborting destructive operation.")
    }
  })

  it("should create a user document", async () => {
    const email = faker.internet.email({ provider: "test.com" }).toLocaleLowerCase()

    const { uid } = await createAuthUser({ email })

    const snapshot = await refs.users.doc(uid).get()

    const userDoc = snapshot.data()

    expect(userDoc).toHaveProperty("email", email)
    expect(userDoc).toHaveProperty("createdAt")
    expect(userDoc).toHaveProperty("updatedAt")
    expect(userDoc?.pseudo).toBeTruthy()
  })
})
