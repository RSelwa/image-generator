import { Separator } from "@radix-ui/react-separator"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState } from "react"
import * as React from "react"
import MiniMap from "@/components/mini-map"
import { Button } from "@/components/ui/button"
import { ImageGlow } from "@/components/ui/image-glow"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { TextRevealTW } from "@/components/ui/text-reveal"
import { useSubmitRoundAnswerMutation, useSubscribeLobbyQuery, useUpdateNextRoundMutation, useUpdatePlayerScoreMutation } from "@/redux/api/lobby"
import { selectAllPlayersReady, selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundIndex, selectCurrentRoundInfos, selectIsLobbyHost } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const NextRoundButton = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [popOverOpen, setPopOverOpen] = useState(false)

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const isEveryoneReady = useAppSelector(selectAllPlayersReady(lobbyId, roundIndex))

  const [nextRound] = useUpdateNextRoundMutation()

  if (isEveryoneReady) {
    return (
      <Button variant="outline" onClick={() => nextRound({ lobbyId })}>
        Next round
      </Button>
    )
  }

  return (
    <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Next round
        </Button>

      </PopoverTrigger>
      <PopoverContent className="text-white bg-primary text-center flex flex-col items-center justify-center gap-2 w-96">
        <span className="text-sm text-muted-primary-foreground">Not all players have finished the round. <br /> Are you sure to go next round ? (they will loose their points on this round)</span>
        <div className="flex gap-2 items-center justify-center">
          <Button onClick={() => nextRound({ lobbyId })}>
            Yes, go next round
          </Button>
          <Button variant="ghost" onClick={() => setPopOverOpen(false)}>
            No, wait for players
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const Rounds = ({ currentRound, numberOfRounds }: { currentRound: number, numberOfRounds: number }) => (
  <article className="flex items-center gap-3 text-white font-bold">
    {Array.from({ length: numberOfRounds }, (_, i) => (
      <Fragment key={i}>
        <div
          data-is-active={i + 1 === currentRound}
          data-is-completed={i + 1 < (currentRound)}
          className="size-6 flex items-center justify-center data-[is-completed=true]:bg-white data-[is-completed=true]:text-neutral-900 text-white bg-transparent data-[is-active=true]:bg-white data-[is-active=true]:text-neutral-900 data-[is-active=true]:shadow-glow data-[is-active=true]:shadow-sky-600/50"
        >
          {i + 1}
        </div>
        <Separator orientation="vertical" className="h-4 w-px bg-white" />
      </Fragment>

    ))}
  </article>
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
        <Image src={currentRoundInfos?.gameThumbnailUrl || ""} height={300} width={300} alt={currentRoundInfos?.gameTitle || ""} />
      </ImageGlow>
      <TextRevealTW text={`Game guessed: +${currentAnswer?.gamePoints}pts`} className="text-white text-lg" initialDelay={1.5} />
    </>
  )
}

const InfosRoundNormal = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [animatedPoints, setAnimatedPoints] = useState(0)

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))

  const pointAnimationDelay = 3000
  const pointAnimationDuration = 2000
  const targetPoints = currentAnswer?.distancePoints || 0
  const hasGuessedGame = Boolean(currentAnswer?.isCorrect)

  const percentagePoints = currentRoundData?.pointsDistance ? ((animatedPoints) / (currentRoundData.pointsDistance || 1)) * 100 : 0

  useEffect(() => {
    if (!targetPoints) return

    const timeout = setTimeout(() => {
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

    <div className="flex flex-col items-center gap-2">
      {(!hasGuessedGame) && (
        <ImageGlow>
          <Image src={currentRoundInfos?.gameThumbnailUrl || ""} height={250} width={250} alt={currentRoundInfos?.gameTitle || ""} />
        </ImageGlow>
      )}

      {hasGuessedGame && (
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

      <TextRevealTW text={targetPoints.toString()} className="text-white text-lg" initialDelay={2} />
      <div className="text-white text-lg text-shadow flex items-center gap-2 transition-opacity duration-500 delay-[2s]">
        <span>
          0
        </span>
        <Progress value={percentagePoints} indicatorClassName="bg-white" className="bg-neutral-500/50 w-52" />
        <span>
          {currentRoundData.pointsDistance}
        </span>
      </div>

      <TextRevealTW initialDelay={4} text={`Total: +${currentAnswer?.points} Pts`} className="text-white text-lg" />

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
  const isEveryOneReady = useAppSelector(selectAllPlayersReady(lobbyId, roundIndex))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const currentAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))
  const isOwner = useAppSelector(selectIsLobbyHost(lobbyId))

  const isRoundSpecial = currentRoundData?.isSpecial

  useEffect(() => {
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
  }, [])

  if (!currentRoundData) return <div className="min-h-full-height">Loading round data...</div>

  return (
    <section className="h-full-height absolute z-10 bg-primary/90 w-full">
      <div className="flex flex-col gap-8 justify-center items-center size-full">
        <Rounds currentRound={lobby?.currentRound || 0} numberOfRounds={lobby?.config?.numberOfRounds || 0} />
        <TextRevealTW text={currentRoundInfos?.gameTitle || "Game title"} className="text-white font-bold text-2xl" />
        {isEveryOneReady ? "ready" : "not"}

        {isRoundSpecial && <InfoRoundSpecial /> }

        {!isRoundSpecial && <InfosRoundNormal /> }

        {isOwner && <NextRoundButton />}
      </div>
    </section>
  )
}
