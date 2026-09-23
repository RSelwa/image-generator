import { afterEach, describe, expect, it, vi } from "vitest"
import { REFERRAL_CODE_LENGTH } from "../constants/firestore"
import { generateReferralCode } from "./referral-code"

const ALMOST_ONE = 0.999_999

describe("generateReferralCode", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("when random draws its lowest value", () => {
    it("should keep the leading zeros", () => {
      vi.spyOn(Math, "random").mockReturnValue(0)

      expect(generateReferralCode()).toBe("0".repeat(REFERRAL_CODE_LENGTH))
    })
  })

  describe("when random draws its highest value", () => {
    it("should stay a single digit per position", () => {
      vi.spyOn(Math, "random").mockReturnValue(ALMOST_ONE)

      expect(generateReferralCode()).toBe("9".repeat(REFERRAL_CODE_LENGTH))
    })
  })

  describe("when random is not mocked", () => {
    it("should return only digits", () => {
      expect(generateReferralCode()).toMatch(
        new RegExp(`^\\d{${REFERRAL_CODE_LENGTH}}$`),
      )
    })
  })
})
