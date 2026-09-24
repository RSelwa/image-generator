"use client"

import { getAvailablePacks, getNextPackAt, PACKS_MAX } from "@repo/common"
import { Package } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { SELECTORS } from "@/constants/testing"
import { formatCountdown } from "@/utils/countdown"

const TICK_MS = 1_000

type PackCounterProps = {
  packsStored: number
  refillAnchorMs: number | null
  isOpening: boolean
  onOpen: () => void
}

export const PackCounter = ({
  packsStored,
  refillAnchorMs,
  isOpening,
  onOpen,
}: PackCounterProps) => {
  const t = useTranslations("packs")
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), TICK_MS)

    return () => clearInterval(interval)
  }, [])

  const stock = { packsStored, refillAnchorMs, nowMs }
  const availablePacks = getAvailablePacks(stock)
  const nextPackAt = getNextPackAt(stock)
  const hasNoPack = availablePacks === 0

  return (
    <section className="flex flex-col items-center gap-4">
      <button
        type="button"
        disabled={hasNoPack || isOpening}
        onClick={onOpen}
        data-testid={SELECTORS.PACK_OPEN}
        className="flex aspect-5/7 w-48 flex-col items-center justify-center gap-3 rounded-2xl border-4 border-primary bg-linear-to-br from-primary/30 to-purple-500/30 font-semibold shadow-xl transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:grayscale disabled:hover:scale-100"
      >
        <Package className="size-16" />
        {hasNoPack && t("empty")}
        {!hasNoPack && t("open")}
      </button>
      <p
        className="text-4xl font-bold tabular-nums"
        data-testid={SELECTORS.PACK_STOCK}
      >
        {t("stock", { available: availablePacks, max: PACKS_MAX })}
      </p>
      {nextPackAt && (
        <p
          className="text-muted-foreground tabular-nums"
          data-testid={SELECTORS.PACK_TIMER}
        >
          {t("nextPack", { time: formatCountdown(nextPackAt - nowMs) })}
        </p>
      )}
      {!nextPackAt && <p className="text-muted-foreground">{t("full")}</p>}
    </section>
  )
}
