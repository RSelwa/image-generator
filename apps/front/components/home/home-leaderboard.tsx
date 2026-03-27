"use client"

import { type RaceLeaderboardPlayer, type StreakLeaderboardPlayer } from "@repo/schemas"
import { Flame, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useGetTopPlayersByBestRaceScoreQuery, useGetTopPlayersByMaxStreakQuery } from "@/redux/api/user"
import { cn } from "@/utils"
import { isTextGlow } from "@/utils/user"

const StreakRow = ({ player, rank }: { player: StreakLeaderboardPlayer, rank: number }) => (
  <div className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0">
    <span className="font-shapiro-wide text-sm w-5 text-center text-muted-foreground">#{rank}</span>
    <UserAvatar size="sm" avatar={player.avatar || undefined} name={player.pseudo || "?"} donorTier={player.donorTier} fallbackClassName="font-bold" />
    <span className={cn("flex-1 truncate font-shapiro-wide text-sm", isTextGlow(player.donorTier) && "glow-text")}>{player.pseudo || "—"}</span>
    <span className="font-shapiro-wide text-sm flex items-center gap-1">
      <Flame className="size-3.5 text-primary" />
      {player.maxStreak || 0}
    </span>
  </div>
)

const RaceRow = ({ player, rank }: { player: RaceLeaderboardPlayer, rank: number }) => (
  <div className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0">
    <span className="font-shapiro-wide text-sm w-5 text-center text-muted-foreground">#{rank}</span>
    <UserAvatar size="sm" avatar={player.avatar || undefined} name={player.pseudo || "?"} donorTier={player.donorTier} fallbackClassName="font-bold" />
    <span className={cn("flex-1 truncate font-shapiro-wide text-sm ml-3", isTextGlow(player.donorTier))}>{player.pseudo || "—"}</span>
    <span className="font-shapiro-wide text-sm flex items-center gap-1">
      <Trophy className="size-3.5 text-primary" />
      {player.bestRaceScore || 0}
    </span>
  </div>
)

export const HomeLeaderboard = () => {
  const t = useTranslations("home")
  const { data: streakPlayers } = useGetTopPlayersByMaxStreakQuery()
  const { data: racePlayers } = useGetTopPlayersByBestRaceScoreQuery()

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      <article className="p-5 border-r border-neutral-900">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("dailyChallengeStreak")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {streakPlayers?.map((player, i) => (
            <StreakRow key={player.id} player={player} rank={i + 1} />
          ))}
        </div>
      </article>
      <article className="p-5">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("raceHighScore")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {racePlayers?.map((player, i) => (
            <RaceRow key={player.id} player={player} rank={i + 1} />
          ))}
        </div>
      </article>
    </section>
  )
}
