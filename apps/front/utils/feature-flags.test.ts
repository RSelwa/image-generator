import { describe, expect, it } from "vitest"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { QUERY_PARAMS } from "@/constants/mapping"
import { getFeatureFlagUrl, parseFeatureFlagParam } from "@/utils/feature-flags"

describe("parseFeatureFlagParam", () => {
  describe("when the param enables a known flag", () => {
    it("should return the flag enabled", () => {
      expect(parseFeatureFlagParam("credits-true")).toEqual({
        flag: FEATURE_FLAGS.CREDITS,
        isEnabled: true,
      })
    })
  })

  describe("when the param disables a known flag", () => {
    it("should return the flag disabled", () => {
      expect(parseFeatureFlagParam("achievements-false")).toEqual({
        flag: FEATURE_FLAGS.ACHIEVEMENTS,
        isEnabled: false,
      })
    })
  })

  describe("when the param has no status", () => {
    it("should return the flag disabled", () => {
      expect(parseFeatureFlagParam("credits")).toEqual({
        flag: FEATURE_FLAGS.CREDITS,
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
        getFeatureFlagUrl(
          "https://example.com/en/play?code=42",
          FEATURE_FLAGS.CREDITS,
        ),
      ).toBe("https://example.com/en/play?code=42&ff=credits-true")
    })
  })

  describe("when the url already carries a flag", () => {
    it("should replace it", () => {
      expect(
        getFeatureFlagUrl(
          "https://example.com/en?ff=other-false",
          FEATURE_FLAGS.CREDITS,
        ),
      ).toBe("https://example.com/en?ff=credits-true")
    })
  })
})

describe("when a declared flag is shared through its link", () => {
  it.each(Object.values(FEATURE_FLAGS))(
    "should parse %s back as enabled",
    (flag) => {
      const param = new URL(
        getFeatureFlagUrl("https://example.com/en", flag),
      ).searchParams.get(QUERY_PARAMS.FEATURE_FLAG)

      expect(parseFeatureFlagParam(param)).toEqual({ flag, isEnabled: true })
    },
  )
})
