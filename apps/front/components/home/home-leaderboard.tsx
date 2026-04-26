"use client"

import { type PublicPlayer } from "@repo/schemas"
import { FlameIcon, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactNode } from "react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useGetTopPlayersByBestDeathRunScoreQuery, useGetTopPlayersByBestRaceScoreQuery, useGetTopPlayersByMaxStreakQuery, useGetTopRaceRunsByWeekQuery } from "@/redux/api/user"
import { getDonorTierByRank, isTextGlow } from "@/utils/user"

const RowPlayer = ({ player, rank, score, icon }: { player: PublicPlayer, rank: number, score?: number | null, icon?: ReactNode }) => {
  const rankDonorTier = getDonorTierByRank(rank)
  const donorTier = player.donorTier || rankDonorTier

  return (
    <div className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0">
      <span className="font-shapiro-wide text-sm w-5 text-center text-muted-foreground">#{rank}</span>
      <UserAvatar size="sm" avatar={player.avatar || undefined} name={player.pseudo || "?"} donorTier={donorTier} fallbackClassName="font-bold" />
      <span data-text-glow={isTextGlow(donorTier)} className="flex-1 truncate font-shapiro-wide text-sm">{player.pseudo || "—"}</span>
      <span className="font-shapiro-wide text-sm flex items-center gap-1">
        {icon || <Trophy className="size-3.5 text-primary" />}
        {score || 0}
      </span>
    </div>
  )
}

export const HomeLeaderboard = () => {
  const t = useTranslations("home")
  const { data: streakPlayers } = useGetTopPlayersByMaxStreakQuery()
  const { data: racePlayers } = useGetTopPlayersByBestRaceScoreQuery()
  const { data: deathRunPlayers } = useGetTopPlayersByBestDeathRunScoreQuery()
  const { data: weeklyRacePlayers } = useGetTopRaceRunsByWeekQuery()

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4">
      <article className="p-5 border-r border-neutral-900">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("dailyChallengeStreak")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {streakPlayers?.map((player, i) => (
            <RowPlayer score={player.maxStreak} key={player.id} player={player} rank={i + 1} icon={<FlameIcon className="size-3.5 text-primary" />} />
          ))}
        </div>
      </article>
      <article className="p-5">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("raceHighScore")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {racePlayers?.map((player, i) => (
            <RowPlayer score={player.bestRaceScore} key={player.id} player={player} rank={i + 1} />
          ))}
        </div>
      </article>
      <article className="p-5">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("deathRaceHighScore")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {deathRunPlayers?.map((player, i) => (
            <RowPlayer key={player.id} player={player} rank={i + 1} score={player.bestDeathRunScore} />
          ))}
        </div>
      </article>
      <article className="p-5">
        <p className="font-interference uppercase mb-2 text-sm opacity-60">{t("leaderboard")}</p>
        <h2 className="font-shapiro-wide text-2xl lg:text-3xl mb-6">{t("weeklyRaceHighScore")}</h2>
        <div className="overflow-y-scroll max-h-40">
          {weeklyRacePlayers?.map((player, i) => (
            <RowPlayer key={player.id} player={player} rank={i + 1} score={player.score} />
          ))}
        </div>
      </article>
    </section>
  )
}
