import { generateReferralCode } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { userDocSchema } from "@repo/schemas"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { generateUniqueReferralCode } from "~/referral-code"

vi.mock("@repo/common", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/common")>()),
  generateReferralCode: vi.fn(),
}))

const TAKEN_CODE = "111111"
const FREE_CODE = "222222"
const TAKEN_CODE_USER_ID = "referral-code-owner"

describe("generateUniqueReferralCode", () => {
  beforeAll(() => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      throw new Error(
        "FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.",
      )
    }
  })

  afterEach(async () => {
    vi.mocked(generateReferralCode).mockReset()
    await refs.users.doc(TAKEN_CODE_USER_ID).delete()
  })

  describe("when the first generated code is free", () => {
    it("should return it", async () => {
      vi.mocked(generateReferralCode).mockReturnValueOnce(FREE_CODE)

      expect(await generateUniqueReferralCode()).toBe(FREE_CODE)
    })
  })

  describe("when the generated code is already taken", () => {
    it("should regenerate until a free one", async () => {
      await refs.users.doc(TAKEN_CODE_USER_ID).set(
        userDocSchema.parse({
          email: "owner@test.com",
          referralCode: TAKEN_CODE,
        }),
      )
      vi.mocked(generateReferralCode)
        .mockReturnValueOnce(TAKEN_CODE)
        .mockReturnValueOnce(FREE_CODE)

      expect(await generateUniqueReferralCode()).toBe(FREE_CODE)
      expect(generateReferralCode).toHaveBeenCalledTimes(2)
    })
  })
})
