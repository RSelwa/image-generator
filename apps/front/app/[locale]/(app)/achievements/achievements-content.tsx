"use client"

import { type AchievementDoc } from "@repo/schemas"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { AchievementCard } from "@/components/cards/achievement-card"
import Loader from "@/components/icons/loader"
import { FEATURE_FLAGS } from "@/constants/feature-flags"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { useFeatureFlag } from "@/hooks/use-feature-flag"
import { useRouter } from "@/i18n/routing"
import { useGetUnlockedAchievementsQuery } from "@/redux/api/achievements"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type AchievementsContentProps = {
  achievements: AchievementDoc[]
}

export const AchievementsContent = ({
  achievements,
}: AchievementsContentProps) => {
  const t = useTranslations("achievements")
  const router = useRouter()
  const isAchievementsEnabled = useFeatureFlag(FEATURE_FLAGS.ACHIEVEMENTS)
  const uid = useAppSelector(selectUserId)

  const { data: unlockedAchievements, isError } =
    useGetUnlockedAchievementsQuery(
      { uid },
      { skip: !isAchievementsEnabled || !uid },
    )

  useEffect(() => {
    if (isAchievementsEnabled === false) router.replace(PAGES.HOME)
  }, [isAchievementsEnabled, router])

  if (!isAchievementsEnabled) return null

  const isLoading = !unlockedAchievements && !isError
  const isEmpty = Boolean(unlockedAchievements) && achievements.length === 0

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
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
      {unlockedAchievements && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <li
              key={achievement.key}
              data-testid={SELECTORS.ACHIEVEMENTS_ITEM(achievement.key)}
            >
              <AchievementCard
                achievement={achievement}
                unlocked={unlockedAchievements[achievement.key]}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
