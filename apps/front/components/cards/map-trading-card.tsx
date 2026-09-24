import { type CardRarity } from "@repo/schemas"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import {
  CARD_RARITY_TO_BADGE_VARIANT,
  FALL_BACK_IMAGE,
} from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"

type MapTradingCardProps = {
  mapId: string
  name: string
  imageUrl: string | null
  rarity: CardRarity
  gameTitle?: string
  count?: number
}

export const MapTradingCard = ({
  mapId,
  name,
  imageUrl,
  rarity,
  gameTitle,
  count = 1,
}: MapTradingCardProps) => {
  const t = useTranslations("tradingCard")
  const hasDuplicates = count > 1

  return (
    <article
      data-rarity={rarity}
      data-testid={SELECTORS.TRADING_CARD(mapId)}
      className="relative flex aspect-5/7 w-full flex-col overflow-hidden rounded-xl border-4 bg-card shadow-lg data-[rarity=common]:border-neutral-500 data-[rarity=uncommon]:border-marathon-green data-[rarity=rare]:border-blue-accent data-[rarity=ultraRare]:border-purple-500 data-[rarity=ultraRare]:shadow-purple-500/40 data-[rarity=legendary]:border-yellow-400 data-[rarity=legendary]:shadow-yellow-400/50"
    >
      <div className="relative flex-1">
        <Image
          src={imageUrl || FALL_BACK_IMAGE}
          alt={name}
          fill
          sizes="(min-width: 640px) 240px, 50vw"
          className="object-cover"
        />
        {hasDuplicates && (
          <Badge variant="blur" className="absolute top-2 right-2">
            {t("count", { count })}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate font-semibold">{name}</p>
        {gameTitle && (
          <p className="truncate text-xs text-muted-foreground">{gameTitle}</p>
        )}
        <Badge
          variant={CARD_RARITY_TO_BADGE_VARIANT[rarity]}
          className="self-start"
        >
          {t(`rarity.${rarity}`)}
        </Badge>
      </div>
    </article>
  )
}
