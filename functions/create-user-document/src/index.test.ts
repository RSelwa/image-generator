import { refs } from "@repo/providers/db-refs"
import { db, Timestamp } from "@repo/providers/firebase"
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
    const snapshotInvitations = await refs.invitations.get()

    const batch = db.batch()

    snapshotUsers.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    snapshotInvitations.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    await fetch(
      "http://localhost:9099/emulator/v1/projects/pusher-292200/accounts",
      { method: "DELETE" },
    )
  })

  it("should create a user document", async () => {
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

  it("should create a user document with invitation", async () => {
    await refs.invitations.add({
      email: "test-pro@fl.im",
      invitationType: "organization",
      organizationId: "test-org-id",
      organizationName: "Test Organization",
      subscriptionType: "PRO",
      amountCreditsAi: 0,
      createdAt: Timestamp.now(),
      usedAt: null,
      used: false,
      expired: false,
      expirationDate: Timestamp.fromDate(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      ),
    })

    const { uid } = await createAuthUser({ email: "test-pro@fl.im" })

    const snapshotUser = await refs.users.doc(uid).get()
    const snapshotInvitation = await refs.invitations.get()

    const userDoc = snapshotUser.data()
    const invitationDoc = snapshotInvitation.docs[0]?.data()

    expect(userDoc).toHaveProperty("email", "test-pro@fl.im")
    expect(userDoc).toHaveProperty("status", "Company")
    expect(userDoc).toHaveProperty("company", "Test Organization")
    expect(userDoc).toHaveProperty("subscription.subscriptionType", "PRO")
    expect(invitationDoc).toHaveProperty("used", true)
    expect(invitationDoc).toHaveProperty("usedAt")
  })
})
