"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { MapTradingCard } from "@/components/cards/map-trading-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { Link } from "@/i18n/routing"
import { type OpenedCard } from "@/schemas/packs"

type PackRevealProps = {
  cards: OpenedCard[]
  canOpenAnother: boolean
  onOpenAnother: () => void
  onBack: () => void
}

export const PackReveal = ({
  cards,
  canOpenAnother,
  onOpenAnother,
  onBack,
}: PackRevealProps) => {
  const t = useTranslations("packReveal")
  const [revealedCount, setRevealedCount] = useState(0)
  const isPileDone = revealedCount >= cards.length

  if (isPileDone) {
    return (
      <section
        className="flex flex-col items-center gap-6"
        data-testid={SELECTORS.PACK_REVEAL_SUMMARY}
      >
        <h2 className="text-2xl font-semibold">{t("summaryTitle")}</h2>
        <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
          {cards.map((card, index) => (
            <li key={`${card.cardId}-${index}`} className="relative">
              <MapTradingCard
                mapId={card.mapId}
                name={card.name}
                imageUrl={card.imageUrl}
                rarity={card.cardProperties.rarity}
                number={card.cardProperties.number}
              />
              {card.isNew && (
                <Badge
                  className="absolute -top-2 -left-2"
                  data-testid={SELECTORS.PACK_REVEAL_NEW}
                >
                  {t("new")}
                </Badge>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          {canOpenAnother && (
            <Button
              onClick={onOpenAnother}
              data-testid={SELECTORS.PACK_OPEN_ANOTHER}
            >
              {t("openAnother")}
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link
              href={PAGES.COLLECTION}
              data-testid={SELECTORS.PACK_SEE_COLLECTION}
            >
              {t("seeCollection")}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            data-testid={SELECTORS.PACK_BACK}
          >
            {t("back")}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center gap-4">
      <div className="relative aspect-5/7 w-60">
        {cards.map((card, index) => (
          <button
            key={`${card.cardId}-${index}`}
            type="button"
            aria-label={t("reveal")}
            disabled={index !== revealedCount}
            data-revealed={index < revealedCount}
            onClick={() => setRevealedCount(index + 1)}
            data-testid={SELECTORS.PACK_REVEAL_CARD(index)}
            style={{ zIndex: cards.length - index }}
            className="absolute inset-0 transition-[transform,visibility] duration-500 ease-out data-[revealed=true]:invisible data-[revealed=true]:translate-x-[140%] data-[revealed=true]:rotate-12 motion-reduce:transition-none enabled:cursor-pointer"
          >
            <MapTradingCard
              mapId={card.mapId}
              name={card.name}
              imageUrl={card.imageUrl}
              rarity={card.cardProperties.rarity}
              number={card.cardProperties.number}
            />
          </button>
        ))}
      </div>
      <p
        className="text-muted-foreground tabular-nums"
        data-testid={SELECTORS.PACK_REVEAL_PROGRESS}
      >
        {t("progress", { current: revealedCount + 1, total: cards.length })}
      </p>
    </section>
  )
}
