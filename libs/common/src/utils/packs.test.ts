import { describe, expect, it } from "vitest"
import { PACK_REFILL_MS, PACKS_MAX } from "../constants/constants"
import { consumePack, getAvailablePacks, getNextPackAt } from "./packs"

const ANCHOR_MS = 1_000_000
const HALF_PERIOD_MS = PACK_REFILL_MS / 2

const buildStock = (
  packsStored: number,
  elapsedMs: number,
  refillAnchorMs: number | null = ANCHOR_MS,
) => ({ packsStored, refillAnchorMs, nowMs: ANCHOR_MS + elapsedMs })

describe("when the available packs are computed", () => {
  describe("when the stock is empty and no period has elapsed", () => {
    it("should return no pack", () => {
      expect(getAvailablePacks(buildStock(0, HALF_PERIOD_MS))).toBe(0)
    })
  })

  describe("when periods have elapsed", () => {
    it("should add one pack per full period", () => {
      expect(
        getAvailablePacks(buildStock(3, 2 * PACK_REFILL_MS + HALF_PERIOD_MS)),
      ).toBe(5)
    })
  })

  describe("when the refill would overflow the stock", () => {
    it("should cap it", () => {
      expect(getAvailablePacks(buildStock(8, 5 * PACK_REFILL_MS))).toBe(
        PACKS_MAX,
      )
    })
  })

  describe("when the stock was never consumed", () => {
    it("should return the stored packs", () => {
      expect(getAvailablePacks(buildStock(PACKS_MAX, 0, null))).toBe(PACKS_MAX)
    })
  })

  describe("when the anchor is in the future", () => {
    it("should not remove packs", () => {
      expect(getAvailablePacks(buildStock(4, -PACK_REFILL_MS))).toBe(4)
    })
  })
})

describe("when the next pack date is computed", () => {
  describe("when the stock is not full", () => {
    it("should return the end of the running period", () => {
      expect(
        getNextPackAt(buildStock(3, PACK_REFILL_MS + HALF_PERIOD_MS)),
      ).toBe(ANCHOR_MS + 2 * PACK_REFILL_MS)
    })
  })

  describe("when the stock is full", () => {
    it("should return no date", () => {
      expect(getNextPackAt(buildStock(9, PACK_REFILL_MS))).toBeNull()
    })
  })

  describe("when the stock was never consumed", () => {
    it("should return no date", () => {
      expect(getNextPackAt(buildStock(PACKS_MAX, 0, null))).toBeNull()
    })
  })
})

describe("when a pack is consumed", () => {
  describe("when no pack is available", () => {
    it("should return null", () => {
      expect(consumePack(buildStock(0, HALF_PERIOD_MS))).toBeNull()
    })
  })

  describe("when the stock is partially refilled", () => {
    it("should advance the anchor by the consumed periods only", () => {
      expect(
        consumePack(buildStock(2, 3 * PACK_REFILL_MS + HALF_PERIOD_MS)),
      ).toEqual({
        packsStored: 4,
        refillAnchorMs: ANCHOR_MS + 3 * PACK_REFILL_MS,
      })
    })
  })

  describe("when the stock is full", () => {
    it("should restart the refill from now", () => {
      const stock = buildStock(PACKS_MAX, 4 * PACK_REFILL_MS)

      expect(consumePack(stock)).toEqual({
        packsStored: PACKS_MAX - 1,
        refillAnchorMs: stock.nowMs,
      })
    })
  })

  describe("when the stock was never consumed", () => {
    it("should start the refill from now", () => {
      const stock = buildStock(PACKS_MAX, 0, null)

      expect(consumePack(stock)).toEqual({
        packsStored: PACKS_MAX - 1,
        refillAnchorMs: stock.nowMs,
      })
    })
  })
})
