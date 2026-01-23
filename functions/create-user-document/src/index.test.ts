import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { beforeAll, describe, expect, it } from "vitest"

const createAuthUser = async ({
  email,
  password = "Test1234!",
}: {
  email: string
  password?: string
}) => {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )

  const data = (await res.json()) as { localId: string; email: string }

  return { uid: data.localId, email: data.email }
}

describe("createUserDocument", () => {
  beforeAll(async () => {
    const snapshotUsers = await refs.users.get()

    const batch = db.batch()

    snapshotUsers.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    await fetch(
      "http://localhost:9099/emulator/v1/projects/pusher-292200/accounts",
      { method: "DELETE" },
    )
  })

  it.skip("should create a user document", async () => {
    const { uid } = await createAuthUser({ email: "test-base@fl.im" })

    const snapshot = await refs.users.doc(uid).get()

    const userDoc = snapshot.data()

    expect(userDoc).toHaveProperty("email", "test-base@fl.im")
    expect(userDoc).toHaveProperty("zoomClicks", 0)
    expect(userDoc).toHaveProperty("preferences", {
      grid: {
        masonry: {
          spacing: 10,
          nbColumns: 6,
          hasNameDisplayed: false,
        },
      },
      generationGrid: {
        gridType: "LIST",
        options: {
          mode: "ASPECT",
          size: 6,
        },
      },
      safetyContentFilter: {
        hideNudity: true,
        hideViolence: true,
      },
      isVideoAutoplay: true,
    })
  })
})
