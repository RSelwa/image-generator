import { PACKS_MAX } from "@repo/common"
import { userDocSchema } from "@repo/schemas"
import { type User } from "firebase/auth"
import { Timestamp } from "firebase/firestore"
import { describe, expect, it } from "vitest"
import { formatSessionFromFirebaseUser } from "@/utils/user"

const AUTH_USER = {
  uid: "uid",
  displayName: null,
  isAnonymous: false,
} as User
const ANCHOR_MS = 1_700_000_000_000

const formatSession = (user: Record<string, unknown>) =>
  formatSessionFromFirebaseUser({
    user: userDocSchema.parse({ email: "player@example.com", ...user }),
    authUser: AUTH_USER,
    rightsDoc: null,
  })

describe("when the user doc has a pack stock", () => {
  it("should expose it with the refill anchor in milliseconds", () => {
    expect(
      formatSession({
        packsStored: 7,
        packsRefillAnchor: Timestamp.fromMillis(ANCHOR_MS),
      }),
    ).toMatchObject({ packsStored: 7, packsRefillAnchorMs: ANCHOR_MS })
  })
})

describe("when the user doc has no pack stock", () => {
  it("should expose a full stock without anchor", () => {
    expect(formatSession({})).toMatchObject({
      packsStored: PACKS_MAX,
      packsRefillAnchorMs: null,
    })
  })
})
