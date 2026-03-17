import { DEFAULT_TIME_PER_ROUND } from "@repo/common"
import { DisplayGame } from "@/components/lobby/playing/game-display"
import GameInputGuess from "@/components/lobby/playing/game-input-guess"
import GameMapGuess from "@/components/lobby/playing/game-map"
import LoadingGameData from "@/components/lobby/playing/loading-game-data"
import PlayingNormalRound from "@/components/lobby/playing/normal-round"
import { RoundInfos } from "@/components/lobby/playing/round-infos"
import PlayingSpecialRound from "@/components/lobby/playing/special-round"
import Timer from "@/components/lobby/playing/timer"
import { useIsExpired } from "@/hooks/use-countdown"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePathname } from "@/i18n/routing"
import { useListenRoundAnswerQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundEntity, selectCurrentRoundGameTitle, selectCurrentRoundIndex, selectHasSelectedOption, selectIsPlayerEliminated, selectLobbyConfig, selectMyLivesRemaining } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyPlaying = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })
  const { isLoading: isLoadingRoundAnswer } = useListenRoundAnswerQuery({ lobbyId, roundIndex: lobby?.currentRound || 0 }, {
    skip: !lobbyId || !lobby || !lobby.currentRound || lobby.currentRound === 0,

  })

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const livesRemaining = useAppSelector(selectMyLivesRemaining(lobbyId, roundIndex))
  const isEliminated = useAppSelector(selectIsPlayerEliminated(lobbyId, roundIndex))
  const myAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const config = useAppSelector(selectLobbyConfig(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const roundEntity = useAppSelector(selectCurrentRoundEntity(lobbyId))
  const gameTitle = useAppSelector(selectCurrentRoundGameTitle(lobbyId, roundIndex))

  const hasSelectedOption = useAppSelector(selectHasSelectedOption(lobbyId, roundIndex))
  const isNormalFullRound = roundEntity && !roundEntity.isSpecial && roundEntity.mode === "full"
  const isMapPhase = myAnswer?.isCorrect && isNormalFullRound
  const isWaitingForSelection = roundEntity?.isSpecial && !hasSelectedOption
  const timerStart = isWaitingForSelection ? null : ((isMapPhase && myAnswer?.submittedAt) || myAnswer?.selectedOptionAt || lobby?.roundStartedAt)

  const isExpired = useIsExpired(timerStart, (config?.roundDuration || DEFAULT_TIME_PER_ROUND))
  const isMobile = useIsMobile()

  const hasSubmittedAnswer = Boolean((gameTitle && myAnswer?.isCorrect))
  const hasFinishedRound = (hasSubmittedAnswer && !isNormalFullRound) || (hasSubmittedAnswer && isNormalFullRound && myAnswer?.position)
  const isDisplayGame = !isLoadingRoundAnswer && Boolean(hasFinishedRound || isExpired || (!livesRemaining && config?.playersLives))
  const isDisplayTimer = !isDisplayGame && Boolean(timerStart)
  const isDisplayInput = !myAnswer?.isCorrect && !isExpired && !isEliminated && !isWaitingForSelection
  const isDisplayMap = isMapPhase && !isDisplayGame && !isEliminated
  const isDisplayRoundInfos = !isMobile && !isDisplayGame

  if (isLobbyLoading || !lobby) return <div>Loading...</div>

  if (!currentRoundData) return <LoadingGameData />

  return (
    <main className="min-h-full-height relative">

      {isDisplayTimer && <Timer />}
      {isDisplayGame && <DisplayGame />}

      {isDisplayRoundInfos && <RoundInfos />}

      {isDisplayInput && <GameInputGuess />}

      {isDisplayMap && <GameMapGuess />}

      {currentRoundData.isSpecial && <PlayingSpecialRound />}
      {!currentRoundData.isSpecial && <PlayingNormalRound />}
    </main>
  )
}

export default LobbyPlaying
