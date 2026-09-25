"use client"

import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { MapTradingCard } from "@/components/cards/map-trading-card"
import { Badge } from "@/components/ui/badge"
import Loader from "@/components/icons/loader"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { useFeatureFlag } from "@/hooks/use-feature-flag"
import { useRouter } from "@/i18n/routing"
import { useGetUserCardCountsQuery } from "@/redux/api/packs"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { formatCardNumber } from "@/utils/card-number"
import { buildCollectionBinder, type CollectionCard } from "@/utils/collection"

type CollectionContentProps = {
  cards: CollectionCard[]
  gameTitles: Record<string, string>
}

export const CollectionContent = ({
  cards,
  gameTitles,
}: CollectionContentProps) => {
  const t = useTranslations("collection")
  const router = useRouter()
  const isTcgEnabled = useFeatureFlag(FEATURE_FLAGS.TCG)
  const uid = useAppSelector(selectUserId)

  const shouldSkipCounts = !isTcgEnabled || !uid
  const { data: ownedCounts, isError } = useGetUserCardCountsQuery(
    { uid },
    { skip: shouldSkipCounts },
  )

  useEffect(() => {
    if (isTcgEnabled === false) router.replace(PAGES.HOME)
  }, [isTcgEnabled, router])

  if (!isTcgEnabled) return null

  const binder =
    ownedCounts && buildCollectionBinder(cards, gameTitles, ownedCounts)
  const isLoading = !shouldSkipCounts && !ownedCounts && !isError
  const isEmpty = Boolean(ownedCounts) && cards.length === 0

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader className="size-8" />
        </div>
      )}
      {isError && (
        <p className="text-center py-12 text-muted-foreground">{t("error")}</p>
      )}
      {isEmpty && (
        <p className="text-center py-12 text-muted-foreground">{t("empty")}</p>
      )}
      {binder && (
        <div className="flex flex-col gap-10">
          <p
            className="text-center text-2xl font-bold tabular-nums"
            data-testid={SELECTORS.COLLECTION_PROGRESS}
          >
            {t("overallProgress", {
              owned: binder.ownedCount,
              total: binder.total,
            })}
          </p>
          {binder.groups.map((group) => (
            <section
              key={group.gameId}
              data-testid={SELECTORS.COLLECTION_GAME(group.gameId)}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">{group.gameTitle}</h2>
                <p
                  className="text-muted-foreground tabular-nums"
                  data-testid={SELECTORS.COLLECTION_GAME_PROGRESS(group.gameId)}
                >
                  {t("progress", {
                    owned: group.ownedCount,
                    total: group.cards.length,
                  })}
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                {group.cards.map((card) => (
                  <li key={card.cardId}>
                    {card.count > 0 && (
                      <MapTradingCard
                        mapId={card.mapId}
                        name={card.name}
                        imageUrl={card.imageUrl}
                        rarity={card.rarity}
                        number={card.number}
                        count={card.count}
                      />
                    )}
                    {card.count === 0 && (
                      <div
                        data-rarity={card.rarity}
                        aria-label={t("locked")}
                        role="img"
                        data-testid={SELECTORS.COLLECTION_LOCKED_CARD(
                          card.cardId,
                        )}
                        className="relative flex aspect-5/7 w-full items-center justify-center rounded-xl border-4 border-dashed bg-muted text-muted-foreground data-[rarity=common]:border-neutral-500 data-[rarity=uncommon]:border-marathon-green data-[rarity=rare]:border-blue-accent data-[rarity=ultraRare]:border-purple-500 data-[rarity=legendary]:border-yellow-400"
                      >
                        <Lock className="size-10" />
                        <Badge
                          variant="blur"
                          className="absolute top-2 left-2 tabular-nums"
                        >
                          {formatCardNumber(card.number)}
                        </Badge>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
