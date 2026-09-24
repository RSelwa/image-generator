"use client"

import { PACK_REFILL_MS, PACKS_MAX } from "@repo/common"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { MapTradingCard } from "@/components/cards/map-trading-card"
import { PackCounter } from "@/components/tcg/pack-counter"
import { Button } from "@/components/ui/button"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { useFeatureFlag } from "@/hooks/use-feature-flag"
import { useRouter } from "@/i18n/routing"
import { useOpenPackMutation } from "@/redux/api/packs"
import {
  selectPacksRefillAnchorMs,
  selectPacksStored,
} from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const MS_PER_MINUTE = 60_000

export const PacksContent = () => {
  const t = useTranslations("packs")
  const router = useRouter()
  const isTcgEnabled = useFeatureFlag(FEATURE_FLAGS.TCG)
  const packsStored = useAppSelector(selectPacksStored)
  const refillAnchorMs = useAppSelector(selectPacksRefillAnchorMs)
  const [openPack, { data: openedPack, isLoading, isError, reset }] =
    useOpenPackMutation()

  useEffect(() => {
    if (isTcgEnabled === false) router.replace(PAGES.HOME)
  }, [isTcgEnabled, router])

  if (!isTcgEnabled) return null

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("description", {
            minutes: PACK_REFILL_MS / MS_PER_MINUTE,
            max: PACKS_MAX,
          })}
        </p>
      </div>
      {openedPack && (
        <section className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold">{t("openedTitle")}</h2>
          <ul
            className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5"
            data-testid={SELECTORS.PACK_OPENED_CARDS}
          >
            {openedPack.cards.map((card, index) => (
              <li key={`${card.mapId}-${index}`}>
                <MapTradingCard
                  mapId={card.mapId}
                  name={card.name}
                  imageUrl={card.imageUrl}
                  rarity={card.cardProperties.rarity}
                />
              </li>
            ))}
          </ul>
          <Button onClick={reset} data-testid={SELECTORS.PACK_BACK}>
            {t("back")}
          </Button>
        </section>
      )}
      {!openedPack && (
        <PackCounter
          packsStored={packsStored}
          refillAnchorMs={refillAnchorMs}
          isOpening={isLoading}
          onOpen={() => openPack()}
        />
      )}
      {isError && (
        <p className="text-center py-6 text-destructive">{t("error")}</p>
      )}
    </main>
  )
}
