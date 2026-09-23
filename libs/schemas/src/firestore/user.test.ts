import { describe, expect, it } from "vitest"
import { userDocSchema } from "~/firestore/user"

const EMAIL = "player@example.com"
const REFERRAL_CODE = "042137"

describe("userDocSchema", () => {
  describe("when the user doc has no credits nor referral code", () => {
    it("should default credits to 0", () => {
      expect(userDocSchema.parse({ email: EMAIL }).credits).toBe(0)
    })

    it("should leave the referral code unset", () => {
      expect(userDocSchema.parse({ email: EMAIL })).not.toHaveProperty(
        "referralCode",
      )
    })
  })

  describe("when the user doc has credits and a referral code", () => {
    it("should keep them", () => {
      expect(
        userDocSchema.parse({
          email: EMAIL,
          credits: 120,
          referralCode: REFERRAL_CODE,
        }),
      ).toMatchObject({ credits: 120, referralCode: REFERRAL_CODE })
    })
  })

  describe("when the referral code is a number", () => {
    it("should reject it", () => {
      expect(
        userDocSchema.safeParse({ email: EMAIL, referralCode: 42_137 }).success,
      ).toBe(false)
    })
  })
})
