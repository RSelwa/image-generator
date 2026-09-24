import { PACK_REFILL_MS, PACKS_MAX } from "../constants/constants"

type PackStock = {
  packsStored: number
  refillAnchorMs: number | null
  nowMs: number
}

const getRefilledPeriods = ({ refillAnchorMs, nowMs }: PackStock) => {
  if (refillAnchorMs === null) return 0

  return Math.max(0, Math.floor((nowMs - refillAnchorMs) / PACK_REFILL_MS))
}

export const getAvailablePacks = (stock: PackStock) =>
  Math.min(PACKS_MAX, stock.packsStored + getRefilledPeriods(stock))

export const getNextPackAt = (stock: PackStock) => {
  const { refillAnchorMs } = stock

  if (refillAnchorMs === null) return null
  if (getAvailablePacks(stock) >= PACKS_MAX) return null

  return refillAnchorMs + (getRefilledPeriods(stock) + 1) * PACK_REFILL_MS
}

export const consumePack = (stock: PackStock) => {
  const availablePacks = getAvailablePacks(stock)
  const { refillAnchorMs, nowMs } = stock

  if (availablePacks === 0) return null

  const packsStored = availablePacks - 1

  if (refillAnchorMs === null) return { packsStored, refillAnchorMs: nowMs }
  if (availablePacks >= PACKS_MAX) return { packsStored, refillAnchorMs: nowMs }

  return {
    packsStored,
    refillAnchorMs: refillAnchorMs + getRefilledPeriods(stock) * PACK_REFILL_MS,
  }
}
