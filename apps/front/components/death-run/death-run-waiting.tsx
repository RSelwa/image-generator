"use client"

import { type DeathRunDocWithId } from "@repo/schemas"
import { Heart, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { ASSET_URLS } from "@/constants/mapping"
import { usePrepareAndStartDeathRunMutation } from "@/redux/api/death-run"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { isTextGlow } from "@/utils/user"

const DeathRunWaiting = ({ deathRun }: { deathRun: DeathRunDocWithId }) => {
  const uid = useAppSelector(selectUserId)
  const t = useTranslations("deathRunPage")
  const [prepareAndStart, { isLoading }] = usePrepareAndStartDeathRunMutation()
  const isHost = deathRun.hostId === uid

  return (
    <div className="relative h-full-height flex flex-col items-center justify-center gap-8 p-6 bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("lobbyTitle")}</h1>
        <p className="text-muted-foreground">
          {t("shareCode")} <span className="font-mono font-bold text-foreground text-xl">{deathRun.code}</span>
        </p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          {Array.from({ length: deathRun.lives }).map((_, i) => (
            <Heart key={i} className="size-3.5 fill-primary text-primary" />
          ))}
          {t("livesInfo", { lives: deathRun.lives })}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="size-4" />
          <span>{deathRun.players.length} player{deathRun.players.length !== 1 ? "s" : ""}</span>
        </div>
        {deathRun.players.map((player) => (
          <div key={player.uid} className="flex items-center gap-3 p-3 rounded-lg border">
            <UserAvatar {...player} className="size-8" />
            <span data-text-glow={isTextGlow(player.donorTier)} className="font-medium">{player.name}</span>
            {player.uid === deathRun.hostId && (
              <span className="ml-auto text-xs text-muted-foreground">host</span>
            )}
          </div>
        ))}
      </div>

      {isHost && (
        <Button
          size="lg"
          disabled={isLoading}
          onClick={() => prepareAndStart({ deathRunId: deathRun.id, playersIds: deathRun.playersIds, lives: deathRun.lives })}
        >
          {t("startGame")}
        </Button>
      )}
      {!isHost && (
        <p className="text-muted-foreground text-sm">{t("waitingForHost")}</p>
      )}
    </div>
  )
}

export default DeathRunWaiting
