import { type AchievementDoc, type UnlockedAchievementDoc } from "@repo/schemas"
import { Calendar, Coins, Lock, Target, Trophy } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT } from "@/constants/mapping"

type AchievementCardProps = {
  achievement: AchievementDoc
  unlocked?: UnlockedAchievementDoc
}

export const AchievementCard = ({
  achievement,
  unlocked,
}: AchievementCardProps) => {
  const t = useTranslations("achievementCard")
  const format = useFormatter()
  const reward = unlocked ? unlocked.reward : achievement.reward

  return (
    <Card
      data-unlocked={Boolean(unlocked)}
      className="gap-3 py-4 data-[unlocked=false]:border-dashed data-[unlocked=false]:text-muted-foreground"
    >
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          {unlocked && (
            <Trophy
              role="img"
              aria-label={t("unlocked")}
              className="size-4 shrink-0 text-primary"
            />
          )}
          {!unlocked && (
            <Lock
              role="img"
              aria-label={t("locked")}
              className="size-4 shrink-0"
            />
          )}
          {achievement.name}
        </CardTitle>
        <CardDescription>{achievement.description}</CardDescription>
        {achievement.difficulty && (
          <CardAction>
            <Badge
              variant={
                ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT[achievement.difficulty]
              }
            >
              {t(`difficulty.${achievement.difficulty}`)}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 text-sm">
        <span className="flex items-center gap-1">
          <Coins className="size-3.5" />
          {t("reward", { reward })}
        </span>
        {achievement.goalToAchieve && (
          <span className="flex items-center gap-1">
            <Target className="size-3.5" />
            {t("goal", { goal: achievement.goalToAchieve })}
          </span>
        )}
        {unlocked && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {t("achievedAt", {
              date: format.dateTime(unlocked.achievedAt.toDate(), {
                dateStyle: "medium",
              }),
            })}
          </span>
        )}
      </CardContent>
    </Card>
  )
}
