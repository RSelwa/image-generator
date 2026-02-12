"use client"

import { Separator } from "@radix-ui/react-separator"
import Image from "next/image"
import { Fragment, useEffect, useState } from "react"
import * as React from "react"
import MiniMap from "@/components/mini-map"
import { useDemoContext } from "@/components/demo/demo-context"
import { Button } from "@/components/ui/button"
import { ImageGlow } from "@/components/ui/image-glow"
import { Progress } from "@/components/ui/progress"
import { TextRevealTW } from "@/components/ui/text-reveal"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

const RoundsIndicator = ({ currentRound, numberOfRounds }: { currentRound: number; numberOfRounds: number }) => (
  <article className="flex items-center gap-3 text-white font-bold">
    {Array.from({ length: numberOfRounds }, (_, i) => (
      <Fragment key={i}>
        <div
          data-is-active={i + 1 === currentRound}
          data-is-completed={i + 1 < currentRound}
          className="size-6 flex items-center justify-center data-[is-completed=true]:bg-white data-[is-completed=true]:text-neutral-900 text-white bg-transparent data-[is-active=true]:bg-white data-[is-active=true]:text-neutral-900 data-[is-active=true]:shadow-glow data-[is-active=true]:shadow-sky-600/50"
        >
          {i + 1}
        </div>
        <Separator orientation="vertical" className="h-4 w-px bg-white" />
      </Fragment>
    ))}
  </article>
)

const DemoInfoSpecial = () => {
  const { selectedOption, gamePoints } = useDemoContext()

  return (
    <>
      <ImageGlow>
        <Image src={selectedOption?.gameThumbnailUrl || FALL_BACK_IMAGE} height={300} width={300} alt={selectedOption?.gameTitle || ""} className="max-h-96" />
      </ImageGlow>
      <TextRevealTW text={`Game guessed: +${gamePoints}pts`} className="text-white text-lg" initialDelay={1.5} />
    </>
  )
}

const DemoInfoNormal = () => {
  const { currentRound, isCorrect, gamePoints, distancePoints, pointsDistance, totalPoints } = useDemoContext()

  const [animatedPoints, setAnimatedPoints] = useState(0)

  const pointAnimationDelay = 3000
  const pointAnimationDuration = 2000
  const targetPoints = distancePoints
  const hasGuessedGame = isCorrect

  const percentagePoints = pointsDistance ? (animatedPoints / (pointsDistance || 1)) * 100 : 0

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

  if (!currentRound) return null

  const roundInfos = currentRound

  return (
    <div className="flex flex-col items-center gap-2">
      {!hasGuessedGame && (
        <ImageGlow>
          <Image src={roundInfos.gameThumbnailUrl || FALL_BACK_IMAGE} height={250} width={250} alt={roundInfos.gameTitle || ""} className="max-h-96" />
        </ImageGlow>
      )}

      {hasGuessedGame && currentRound.mapPosition && (
        <MiniMap
          mapData={{
            mapImage: currentRound.mapImage || "",
            size: {
              width: currentRound.mapWidth || 0,
              height: currentRound.mapHeight || 0,
            },
            correctPosition: currentRound.mapPosition,
          }}
          isParentHover
          hasSubmitted={true}
          guessPosition={{ x: 0, y: 0 }}
          onMapClick={() => void 0}
          inline
        />
      )}

      <TextRevealTW text={`Game guessed: +${gamePoints}pts`} className="text-white text-lg" initialDelay={1.5} />

      <TextRevealTW text={targetPoints.toString()} className="text-white text-lg" initialDelay={2} />
      <div className="text-white text-lg text-shadow flex items-center gap-2 transition-opacity duration-500 delay-[2s]">
        <span>0</span>
        <Progress value={percentagePoints} indicatorClassName="bg-white" className="bg-neutral-500/50 w-52" />
        <span>{pointsDistance}</span>
      </div>

      <TextRevealTW initialDelay={4} text={`Total: +${totalPoints} Pts`} className="text-white text-lg" />
    </div>
  )
}

const DemoDisplay = () => {
  const { currentRound, currentRoundIndex, numberOfRounds, nextRound, selectedOption, demoMode } = useDemoContext()

  if (!currentRound) return null

  const gameTitle = selectedOption?.gameTitle || currentRound.gameTitle || "Game title"
  const isRoundSpecial = currentRound.isSpecial

  return (
    <section className="h-full-height absolute z-10 bg-background/90 w-full">
      <div className="flex flex-col gap-8 justify-center items-center size-full">
        <RoundsIndicator currentRound={currentRoundIndex + 1} numberOfRounds={numberOfRounds} />
        <TextRevealTW text={gameTitle} className="text-white font-bold text-2xl" />

        {isRoundSpecial && demoMode === "full" && <DemoInfoSpecial />}
        {(!isRoundSpecial || demoMode === "simplified") && <DemoInfoNormal />}

        <Button data-testid="demo-next-round-button" onClick={nextRound}>
          Next round
        </Button>
      </div>
    </section>
  )
}

export default DemoDisplay
