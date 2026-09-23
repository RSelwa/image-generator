import { describe, expect, it } from "vitest"
import {
  clientUserDocSchema,
  userDocSchema,
  userDocWithIdSchema,
} from "~/firestore/user"

const USER_DOC = { email: "player@example.com" }
const REFERRAL_CODE = "123456"
const CREDITS = 42

describe("when a user doc has no credits nor referralCode", () => {
  it("should read credits as 0", () => {
    expect(userDocSchema.parse(USER_DOC).credits).toBe(0)
  })

  it("should read credits as 0 with the id", () => {
    expect(userDocWithIdSchema.parse({ ...USER_DOC, id: "uid" }).credits).toBe(
      0,
    )
  })

  it("should leave referralCode undefined", () => {
    expect(userDocSchema.parse(USER_DOC)).not.toHaveProperty("referralCode")
  })
})

describe("when a user doc has credits and a referralCode", () => {
  it("should keep both values", () => {
    expect(
      userDocSchema.parse({
        ...USER_DOC,
        credits: CREDITS,
        referralCode: REFERRAL_CODE,
      }),
    ).toMatchObject({ credits: CREDITS, referralCode: REFERRAL_CODE })
  })
})

describe("when a client builds a user doc to write", () => {
  it("should not add credits nor referralCode", () => {
    const clientUserDoc = clientUserDocSchema.parse(USER_DOC)

    expect(clientUserDoc).not.toHaveProperty("credits")
    expect(clientUserDoc).not.toHaveProperty("referralCode")
  })

  it("should strip credits and referralCode sent in the input", () => {
    const clientUserDoc = clientUserDocSchema.parse({
      ...USER_DOC,
      credits: CREDITS,
      referralCode: REFERRAL_CODE,
    })

    expect(clientUserDoc).not.toHaveProperty("credits")
    expect(clientUserDoc).not.toHaveProperty("referralCode")
  })
})
