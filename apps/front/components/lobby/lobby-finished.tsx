import { ArrowUpRightFromSquare } from "lucide-react"
import { Link } from "@/i18n/routing"
import { usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { CreateLobbyButton } from "@/components/home/home-create-lobby"
import { LogoWithIcon } from "@/components/icons"
import LobbyScoreboard from "@/components/lobby/lobby-scoreboard"
import FinishedLobbyAnonymous from "@/components/modals/finished-lobby-anonymous"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { ASSET_URLS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useGetNumberGameFoundByPlayerQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectLobbyConfig, selectPlayerMyself } from "@/redux/lobby/lobby.selectors"
import { selectUser, selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { copy, getLobbyIdFromPathname } from "@/utils"

const LobbyFinished = () => {
  const t = useTranslations("lobby")
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const userId = useAppSelector(selectUserId)
  const user = useAppSelector(selectUser)
  const player = useAppSelector(selectPlayerMyself(lobbyId))
  const config = useAppSelector(selectLobbyConfig(lobbyId))

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })
  const { data: numberGameFound } = useGetNumberGameFoundByPlayerQuery({ lobbyId, playerId: userId }, {
    skip: !lobbyId || !userId,
  })

  const players = lobby?.players || []
  const hasMultiplePlayers = players.length > 1

  const isUserAnonymous = !user || user.isAnonymous

  const percentageValuePoints = player && lobby ? (player.score / (lobby?.maximumPossiblePoints || 1)) * 100 : 0
  const percentageValueGamesFound = numberGameFound && config ? (numberGameFound.numberGameFound / config.numberOfRounds) * 100 : 0

  const copySeedIdToClipboard = () => {
    if (!lobby?.seedId) return
    copy(lobby.seedId)
    toast.success(t("seedIdCopied"))
  }

  return (
    <main data-testid="lobby-finished" className="min-h-full-height flex items-center justify-center bg-background text-foreground bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <section className="w-1/2 flex flex-col items-center justify-center gap-8 bg-background/80">
        <LogoWithIcon className="text-primary h-52 mb-12" />
        {hasMultiplePlayers && <LobbyScoreboard />}
        {isUserAnonymous && <FinishedLobbyAnonymous />}
        <Field className="w-full max-w-sm">
          <FieldLabel htmlFor="progress-points">
            <span>{t("finalScore")} </span>
            <span className="ml-auto text-lg font-semibold">{player?.score}</span>
          </FieldLabel>
          <FieldLabel className="flex items-center gap-3 text-foreground/50">
            <span>0</span>
            <Progress value={percentageValuePoints} id="progress-points" />
            <span>{lobby?.maximumPossiblePoints}</span>
          </FieldLabel>
        </Field>
        <Field className="w-full max-w-sm">
          <FieldLabel htmlFor="progress-rounds">
            <span>{t("numberGameFound")}</span>
            <span className="ml-auto text-lg font-semibold">{numberGameFound?.numberGameFound.toString()}</span>
          </FieldLabel>
          <FieldLabel className="flex items-center gap-3 text-foreground/50">
            <span>0</span>
            <Progress value={percentageValueGamesFound} id="progress-rounds" />
            <span>{config?.numberOfRounds}</span>
          </FieldLabel>
        </Field>
        <article className="flex items-center justify-center gap-4">
          <Button variant="marathon-white" onClick={copySeedIdToClipboard}>
            {t("shareThisSeed")} <ArrowUpRightFromSquare className="size-4" />
          </Button>
          <Link href={PAGES.HOME} passHref>
            <Button variant="marathon-outline">{t("home")}</Button>
          </Link>
          <CreateLobbyButton>{t("playAgain")}</CreateLobbyButton>
        </article>
      </section>

    </main>
  )
}

export default LobbyFinished
