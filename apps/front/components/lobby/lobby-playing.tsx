import { Timestamp } from "@firebase/firestore"
import { Separator } from "@radix-ui/react-separator"
import { calculateDistancePoints, getDistance, isSameNormalized, ROUND_POINTS, ROUND_TYPE } from "@repo/common"
import { type PlayerAnswer } from "@repo/schemas"
import Image from "next/image"
import { type FormEvent, Fragment, useRef } from "react"
import * as React from "react"
import { useEffect, useState } from "react"
import PlayingSpecialRound from "@/components/lobby/lobby-playing.special-round"
import { type Position } from "@/components/mini-map"
import MiniMap from "@/components/mini-map"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { TextRevealTW } from "@/components/ui/text-reveal"
import { useCountdown } from "@/hooks/use-countdown"
import { useIncrementPlayerLivesUsedMutation, useListenRoundAnswerQuery, useSubmitRoundAnswerMutation, useSubscribeLobbyQuery, useUpdateNextRoundMutation, useUpdatePlayerScoreMutation } from "@/redux/api/lobby"
import { selectAllPlayersReady, selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundGameTitle, selectCurrentRoundIndex, selectCurrentRoundInfos, selectIsPlayerEliminated, selectLobbyConfig, selectMyLivesRemaining, selectPlayerMyself, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
  lobbyId: string
}

const DisplayGame = ({ lobbyId }: Props) => {
  const user = useAppSelector(selectUser)
  const [nextRound] = useUpdateNextRoundMutation()
  const [updatePlayerScore] = useUpdatePlayerScoreMutation()
  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const roundIndex = lobby?.currentRound || 0

  const isEveryOneReady = useAppSelector(selectAllPlayersReady(lobbyId, roundIndex))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))

  const hasGuessedGame = Boolean(currentAnswer?.isCorrect)
  const isRoundSpecial = currentRoundData?.isSpecial
  const percentagePoints = currentRoundData?.pointsDistance ? ((currentAnswer?.distancePoints || 0) / (currentRoundData.pointsDistance || 1)) * 100 : 0

  useEffect(() => {
    const timeout = setTimeout(() => {
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
    }, 6_000)

    return () => clearTimeout(timeout)
  }, [])

  if (!currentRoundData) return <div className="min-h-full-height">Loading round data...</div>

  return (
    <section className="h-full-height absolute z-10 bg-neutral-900/70 w-full">
      <div className="flex flex-col gap-8 justify-center items-center size-full">
        <article className="flex items-center gap-3 text-white font-bold">
          {Array.from({ length: lobby?.config.numberOfRounds || 0 }, (_, i) => (
            <Fragment key={i}>
              <div
                data-is-active={i + 1 === lobby?.currentRound}
                data-is-completed={i + 1 < (lobby?.currentRound || 0)}
                className="size-6 flex items-center justify-center data-[is-completed=true]:bg-white data-[is-completed=true]:text-neutral-900 text-white bg-transparent data-[is-active=true]:bg-white data-[is-active=true]:text-neutral-900 data-[is-active=true]:shadow-glow data-[is-active=true]:shadow-sky-600/50"
              >
                {i + 1}
              </div>
              <Separator orientation="vertical" className="h-4 w-px bg-white" />
            </Fragment>

          ))}
        </article>
        <TextRevealTW text={currentRoundInfos?.gameTitle || "Game title"} className="text-white font-bold text-2xl" />
        {(!hasGuessedGame || isRoundSpecial) && (<Image src={currentRoundInfos?.gameThumbnailUrl || ""} height={300} width={300} alt={currentRoundInfos?.gameTitle || ""} />
        )}

        {hasGuessedGame && !isRoundSpecial && (
          <MiniMap
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
            guessPosition={currentAnswer?.position || { x: 0, y: 0 }}
            onMapClick={() => void 0}
            inline
          />
        )}
        <TextRevealTW text={`Game guessed: +${currentAnswer?.gamePoints}pts`} className="text-white text-lg" initialDelay={1.5} />
        {!isRoundSpecial &&
          (
            <div className="text-white text-lg text-shadow flex items-center gap-2 transition-opacity duration-500 delay-[2s] ">
              <span>
                0
              </span>
              <Progress value={percentagePoints} indicatorClassName="bg-white" className="bg-neutral-500/50 w-52" />
              <span>

                {currentRoundData.pointsDistance}
              </span>
            </div>
          )}

        <TextRevealTW initialDelay={4} text={`Total: +${currentAnswer?.points} Pts`} className="text-white text-lg" />
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button disabled={!isEveryOneReady} variant="outline" onClick={() => nextRound({ lobbyId })}>
              Next round
            </Button>

          </HoverCardTrigger>
          <HoverCardContent className="text-white bg-neutral-800/50 text-center">
            {isEveryOneReady ? "All players are ready for the next round!" : "Waiting for all players to be ready..."}
          </HoverCardContent>
        </HoverCard>
      </div>
    </section>
  )
}

const LobbyPlaying = ({ lobbyId }: Props) => {
  const user = useAppSelector(selectUser)
  const [playPosition, setPlayerPosition] = useState<Position>({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const gameFormRef = useRef<HTMLFormElement>(null)

  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()
  const [incrementLivesUsed] = useIncrementPlayerLivesUsedMutation()

  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })
  const { isLoading: isLoadingRoundAnswer } = useListenRoundAnswerQuery({ lobbyId, roundIndex: lobby?.currentRound || 0 }, {
    skip: !lobbyId || !lobby || !lobby.currentRound || lobby.currentRound === 0,

  })
  const player = useAppSelector(selectPlayerMyself(lobbyId))
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const livesRemaining = useAppSelector(selectMyLivesRemaining(lobbyId, roundIndex))
  const isEliminated = useAppSelector(selectIsPlayerEliminated(lobbyId, roundIndex))
  const myAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const config = useAppSelector(selectLobbyConfig(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const selectedOption = useAppSelector(selectSelectedOption(lobbyId, roundIndex))
  const gameTitle = useAppSelector(selectCurrentRoundGameTitle(lobbyId, roundIndex))

  const isMapPhase = myAnswer?.isCorrect && currentRoundData?.mapPosition
  const timerStart = (isMapPhase && myAnswer?.submittedAt) || lobby?.roundStartedAt

  const { timeRemaining, isExpired } = useCountdown(timerStart, (config?.roundDuration || 60))

  const hasSubmittedAnswer = Boolean((gameTitle && myAnswer?.isCorrect))
  const hasFinishedRound = (hasSubmittedAnswer && !currentRoundData?.mapId) || (hasSubmittedAnswer && (currentRoundData?.mapId && myAnswer?.position))

  const isDisplayGame = !isLoadingRoundAnswer && Boolean(hasFinishedRound || isExpired || (!livesRemaining && config?.playersLives))

  if (isLobbyLoading || !lobby) {
    return <div>Loading...</div>
  }

  const updatingRoundAnswerDoc = async (answer: Partial<PlayerAnswer>) => {
    try {
      await submitRoundAnswer({
        lobbyId,
        roundIndex: lobby.currentRound,
        uid: user?.id || "",
        answer,
      })
    } catch (error) {
      console.error("Error submitting answer:", error)
    }
  }

  const verifyGameName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)
    const input = formdata.get("input")

    if (!currentRoundData) return
    const playerAnswerValue = input?.toString() || ""

    const correctGameName = selectedOption?.gameTitle || currentRoundData.gameTitle || ""

    const isCorrect = Boolean(correctGameName && isSameNormalized(correctGameName, playerAnswerValue))

    if (isCorrect) {
      await updatingRoundAnswerDoc({
        answer: playerAnswerValue,
        submittedAt: Timestamp.now(),
        isCorrect: true,
        gamePoints: ROUND_POINTS.GAME_GUESS,
        points: ROUND_POINTS.GAME_GUESS,
      })
    } else {
      incrementLivesUsed({ lobbyId, playerId: user?.id || "", roundIndex })
      gameFormRef.current?.reset()
    }
  }

  const submitDistance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentRoundData || !currentRoundData.mapPosition) return

    const distance = getDistance(currentRoundData.mapPosition, playPosition)

    const distancePoints = calculateDistancePoints(distance, currentRoundData.pointsDistance || ROUND_POINTS.DISTANCE, currentRoundData.maxDistancePoints || ROUND_POINTS.DISTANCE)

    updatingRoundAnswerDoc({
      position: playPosition,
      positionDistance: distance,
      distancePoints,
      points: (myAnswer?.gamePoints || 0) + distancePoints,
    })
  }

  if (!currentRoundData) return <div className="min-h-full-height">Loading round data...</div>

  return (
    <main className="min-h-full-height relative">

      {!isDisplayGame && (
        <span className="absolute z-10 top-4 left-1/2 -translate-x-1/2 font-bold text-white drop-shadow-2xl text-center text-6xl">
          {timeRemaining}
        </span>
      )}
      {(isDisplayGame) && (<DisplayGame lobbyId={lobbyId} />)}
      <div className=" absolute z-10 top-4 right-8 flex flex-col items-end pr-8 text-white text-shadow-black text-shadow">
        <p>
          Stage: {currentRoundData?.stage}
        </p>
        <p>
          Level: {lobby.currentRound}/{config?.numberOfRounds}
        </p>
        <p>
          Your score: {player?.score} pts
        </p>
      </div>

      {!myAnswer?.isCorrect && !isExpired && !isEliminated && (
        <form ref={gameFormRef} onSubmit={verifyGameName} autoComplete="off" className="absolute z-10 left-1/2 -translate-1/2 bottom-8 flex flex-col items-center gap-4">
          {config?.playersLives && (

            <div className=" mx-auto w-3/4 flex items-center gap-2">
              {
                Array.from({ length: config.playersLives }, (_, i) => (
                  <div
                    key={i}
                    data-is-filled={i < livesRemaining}
                    className="size-6 data-[is-filled=true]:bg-white bg-neutral-50/90 rounded-full data-[is-filled=false]:bg-red-500/80"
                  />
                ))
              }
            </div>
          ) }
          <Input
            name="input"
            type="text"
            placeholder="Your answer"
            autoFocus
            className="bg-neutral-600/50 text-2xl! font-bold placeholder:text-neutral-100 text-neutral-50 min-w-96 py-6"
          />
        </form>
      )}

      {isMapPhase && !isDisplayGame && !isEliminated && currentRoundData.mapPosition && (
        <form
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onSubmit={submitDistance}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
        >
          <p className="w-full bg-neutral-100 text-neutral-900 rounded-sm py-1 text-center text-shadow text-xl font-semibold">
            {currentRoundData.gameTitle}
          </p>

          <MiniMap
            mapData={{
              mapImage: currentRoundData.mapImage || "",
              size: {
                width: currentRoundData.mapWidth || 0,
                height: currentRoundData.mapHeight || 0,
              },
              correctPosition: currentRoundData.mapPosition,

            }}
            showCorrectMarker={false}
            guessPosition={playPosition}
            onMapClick={setPlayerPosition}
            inline
            isParentHover={isHovered}
          />

          <Button type="submit" className="w-full">
            Guess
          </Button>
        </form>
      )}

      {currentRoundData && (currentRoundData.isSpecial ? (
        <PlayingSpecialRound lobbyId={lobbyId} />

      ) : (
        <article>
          {currentRoundData.type === ROUND_TYPE.SPHERICAL && currentRoundData.sphericalImageUrl && (
            <div className="h-full-height">
              <ReactSphere src={currentRoundData.sphericalImageUrl} />
            </div>
          )}
          {currentRoundData.type === ROUND_TYPE.FLAT && (
            <Image src={currentRoundData.flatImageUrl || ""} alt="Current round image" width={1920} height={1080} />
          )}

        </article>
      ))}
    </main>
  )
}

export default LobbyPlaying
