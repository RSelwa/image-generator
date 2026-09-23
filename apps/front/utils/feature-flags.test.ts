import { describe, expect, it, vi } from "vitest"
import { getFeatureFlagUrl, parseFeatureFlagParam } from "@/utils/feature-flags"

vi.mock("@/constants/feature-flags", () => ({
  FEATURE_FLAGS: { TEST: "test" },
}))

const TEST_FLAG = "test" as never

describe("parseFeatureFlagParam", () => {
  describe("when the param enables a known flag", () => {
    it("should return the flag enabled", () => {
      expect(parseFeatureFlagParam("test-true")).toEqual({
        flag: "test",
        isEnabled: true,
      })
    })
  })

  describe("when the param disables a known flag", () => {
    it("should return the flag disabled", () => {
      expect(parseFeatureFlagParam("test-false")).toEqual({
        flag: "test",
        isEnabled: false,
      })
    })
  })

  describe("when the param has no status", () => {
    it("should return the flag disabled", () => {
      expect(parseFeatureFlagParam("test")).toEqual({
        flag: "test",
        isEnabled: false,
      })
    })
  })

  describe("when the param names an unknown flag", () => {
    it("should return null", () => {
      expect(parseFeatureFlagParam("devtools-true")).toBeNull()
    })
  })

  describe("when the param is missing", () => {
    it("should return null", () => {
      expect(parseFeatureFlagParam(null)).toBeNull()
      expect(parseFeatureFlagParam("")).toBeNull()
    })
  })
})

describe("getFeatureFlagUrl", () => {
  describe("when the url has other params", () => {
    it("should keep them and add the enabled flag", () => {
      expect(
        getFeatureFlagUrl("https://example.com/en/play?code=42", TEST_FLAG),
      ).toBe("https://example.com/en/play?code=42&ff=test-true")
    })
  })

  describe("when the url already carries a flag", () => {
    it("should replace it", () => {
      expect(
        getFeatureFlagUrl("https://example.com/en?ff=other-false", TEST_FLAG),
      ).toBe("https://example.com/en?ff=test-true")
    })
  })
})
