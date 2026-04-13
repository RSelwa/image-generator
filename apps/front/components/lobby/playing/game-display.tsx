import { Separator } from "@radix-ui/react-separator"
import { LOBBY_MODES } from "@repo/common"
import Image from "next/image"
import { type ComponentProps } from "react"
import { Fragment, useEffect, useState } from "react"
import useSound from "use-sound"
import GratitudeSection from "@/components/lobby/playing/gratitude-section"
import LoadingGameData from "@/components/lobby/playing/loading-game-data"
import MiniMap from "@/components/mini-map"
import { Button } from "@/components/ui/button"
import { ImageGlow } from "@/components/ui/image-glow"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { TextRevealTW } from "@/components/ui/text-reveal"
import { FALL_BACK_IMAGE } from "@/constants/mapping"
import { SOUNDS } from "@/constants/sound"
import { usePathname } from "@/i18n/routing"
import { useSubmitRoundAnswerMutation, useSubscribeLobbyQuery, useUpdateNextRoundMutation, useUpdatePlayerScoreMutation } from "@/redux/api/lobby"
import { selectAllPlayersReady, selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundIndex, selectCurrentRoundInfos, selectIsLobbyHost, selectLobbyConfig } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const NextRoundButton = (props: ComponentProps<"button">) => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [popOverOpen, setPopOverOpen] = useState(false)

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const isEveryoneReady = useAppSelector(selectAllPlayersReady(lobbyId, roundIndex))

  const [nextRound] = useUpdateNextRoundMutation()

  if (isEveryoneReady) {
    return (
      <Button data-testid="next-round-button" onClick={() => nextRound({ lobbyId })} {...props}>
        Next round
      </Button>
    )
  }

  return (
    <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
      <PopoverTrigger asChild>
        <Button data-testid="next-round-button-popover" {...props}>
          Next round
        </Button>

      </PopoverTrigger>
      <PopoverContent sideOffset={12} className="text-foreground bg-background text-center flex flex-col items-center justify-center gap-6 w-fit font-mono">
        <span className="text-sm text-muted-primary-foreground">Not all players have finished the round. <br /> Are you sure to go next round ? (they will loose their points on this round)</span>
        <div className="flex gap-2 items-center justify-center">
          <Button variant="marathon-link" data-testid="next-round-button-confirm" onClick={() => nextRound({ lobbyId })}>
            Yes, go next round
          </Button>
          <Button onClick={() => setPopOverOpen(false)}>
            No, wait for players
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const Rounds = ({ currentRound, numberOfRounds }: { currentRound: number, numberOfRounds: number }) => (
  <>
    <article className="hidden lg:flex items-center gap-3 text-foreground font-bold font-interference">
      {Array.from({ length: numberOfRounds }, (_, i) => (
        <Fragment key={i}>
          <div
            data-is-active={i + 1 === currentRound}
            data-is-completed={i + 1 < (currentRound)}
            className="size-6 flex items-center justify-center data-[is-completed=true]:bg-primary data-[is-completed=true]:text-primary-foreground text-primary bg-transparent data-[is-active=true]:bg-primary data-[is-active=true]:text-primary-foreground data-[is-active=true]:shadow-glow data-[is-active=true]:shadow-primary/50"
          >
            {i + 1}
          </div>
          <Separator orientation="vertical" className="h-4 w-px bg-primary" />
        </Fragment>

      ))}
    </article>
    <article className="flex lg:hidden items-center gap-3 text-primary font-bold font-interference">
      <span> {currentRound} </span>/ <span>{numberOfRounds}</span>
    </article>
  </>

)

const InfoRoundSpecial = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))

  return (
    <>
      <ImageGlow>
        <Image data-testid={`game-thumbnail-${currentRoundInfos?.gameTitle}`} src={currentRoundInfos?.gameThumbnailUrl || FALL_BACK_IMAGE} height={300} width={300} alt={currentRoundInfos?.gameTitle || ""} className="max-h-96" />
      </ImageGlow>
      <TextRevealTW text={`Game guessed: +${currentAnswer?.gamePoints}pts`} className="text-foreground text-lg" initialDelay={1.5} />
    </>
  )
}

const InfosRoundNormal = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [animatedPoints, setAnimatedPoints] = useState(0)
  const [playPointsCount] = useSound(SOUNDS.POINTS_COUNT, { volume: 0.5 })

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const config = useAppSelector(selectLobbyConfig(lobbyId))

  const isMapOnly = config?.mode === LOBBY_MODES.MAP_ONLY

  const pointAnimationDelay = 3000
  const pointAnimationDuration = 2000

  const targetPoints = currentAnswer?.distancePoints || 0
  const hasGuessedGame = Boolean(currentAnswer?.isCorrect)

  const percentagePoints = currentRoundData?.pointsDistance ? ((animatedPoints) / (currentRoundData.pointsDistance || 1)) * 100 : 0
  const displayMap = isMapOnly || hasGuessedGame

  useEffect(() => {
    if (!targetPoints) return

    const timeout = setTimeout(() => {
      playPointsCount()
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / pointAnimationDuration, 1)
        setAnimatedPoints(Math.round(progress * targetPoints))
        if (progress < 1) requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }, pointAnimationDelay)

    return () => clearTimeout(timeout)
  }, [targetPoints])

  if (!currentRoundData) return null

  return (

    <div className="flex flex-col items-center justify-center gap-2">
      {(!displayMap) && (
        <ImageGlow className="max-w-5/6 flex items-center justify-center">
          <Image data-testid={`game-thumbnail-${currentRoundInfos?.gameTitle}`} src={currentRoundInfos?.gameThumbnailUrl || FALL_BACK_IMAGE} height={250} width={250} alt={currentRoundInfos?.gameTitle || ""} className="max-h-96" />
        </ImageGlow>
      )}

      {displayMap && (
        <MiniMap
          data-testid={`game-map-${currentRoundInfos?.gameTitle}`}
          mapData={{
            mapImage: currentRoundData.mapImage || "",
            size: {
              width: currentRoundData.mapWidth || 0,
              height: currentRoundData.mapHeight || 0,
            },
            correctPosition: currentRoundData.mapPosition || { x: 0, y: 0 },
          }}
          isParentHover
          hasSubmitted={true}
          guessPosition={currentAnswer?.position || null}
          onMapClick={() => void 0}
          inline
        />
      )}

      <TextRevealTW text={`Game guessed: +${currentAnswer?.gamePoints}pts`} className="text-foreground text-lg" initialDelay={1.5} />

      <TextRevealTW text={targetPoints.toString()} className="text-foreground text-lg" initialDelay={2} />
      <div className="text-foreground text-lg text-shadow flex items-center gap-2 transition-opacity duration-500 delay-[2s]">
        <span>
          0
        </span>
        <Progress value={percentagePoints} indicatorClassName="bg-white" className="bg-neutral-500/50 w-52" />
        <span>
          {currentRoundData.pointsDistance}
        </span>
      </div>

      <TextRevealTW initialDelay={4} text={`Total: +${currentAnswer?.points} Pts`} className="text-foreground text-lg" />

    </div>
  )
}

export const DisplayGame = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const user = useAppSelector(selectUser)
  const [updatePlayerScore] = useUpdatePlayerScoreMutation()
  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const isOwner = useAppSelector(selectIsLobbyHost(lobbyId))

  const isRoundSpecial = currentRoundData?.isSpecial

  useEffect(() => {
    if (currentAnswer?.isReadyForNextRound) return

    const newPoint = currentAnswer?.points || 0
    submitRoundAnswer({
      lobbyId,
      roundIndex: lobby?.currentRound || 0,
      uid: user?.id || "",
      answer: { isReadyForNextRound: true },
    })

    updatePlayerScore({
      lobbyId,
      playerId: user?.id || "",
      newPoints: newPoint,
    })
  }, [currentAnswer?.isReadyForNextRound])

  if (!currentRoundData) return <LoadingGameData />

  return (
    <section className="h-full-height absolute z-10 bg-background/90 w-full font-mono py-6">
      <div className="flex flex-col lg:gap-8 gap-8 items-center size-full">
        <Rounds currentRound={lobby?.currentRound || 0} numberOfRounds={lobby?.config?.numberOfRounds || 0} />
        <TextRevealTW text={currentRoundInfos?.gameTitle || "Game title"} className="text-foreground font-bold font-shapiro-wide text-2xl" />
        {isRoundSpecial && <InfoRoundSpecial />}

        {!isRoundSpecial && <InfosRoundNormal />}

        <GratitudeSection
          gameId={currentRoundData.gameId || ""}
          sphericalId={currentRoundData.sphericalId}
          flatId={currentRoundData.flatId}
          mapId={currentRoundData.mapId}
        />

        {isOwner && <NextRoundButton className="mt-2" />}
      </div>
    </section>
  )
}
