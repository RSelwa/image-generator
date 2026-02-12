"use client"

import * as React from "react"
import DemoDisplay from "@/components/demo/demo-display"
import DemoInputGuess from "@/components/demo/demo-input-guess"
import DemoMapGuess from "@/components/demo/demo-map-guess"
import DemoNormalRound from "@/components/demo/demo-normal-round"
import DemoRoundInfos from "@/components/demo/demo-round-infos"
import DemoSpecialRound from "@/components/demo/demo-special-round"
import DemoTimer from "@/components/demo/demo-timer"
import { useDemoContext } from "@/components/demo/demo-context"

const DemoPlaying = () => {
  const {
    currentRound,
    isLoading,
    isCorrect,
    isExpired,
    isEliminated,
    hasSubmittedMap,
    isFinished,
    demoMode,
    hasSelectedOption,
    config,
    livesRemaining,
    nextRound,
    resetDemo,
    score,
    numberOfRounds,
    currentRoundIndex,
  } = useDemoContext()

  if (isLoading) return <div className="min-h-full-height flex items-center justify-center text-foreground">Loading demo...</div>

  if (!currentRound) return <div className="min-h-full-height flex items-center justify-center text-foreground">No seed data available. Set DEMO_SEED_ID in constants/demo.ts</div>

  if (isFinished) {
    return (
      <main className="min-h-full-height flex flex-col items-center justify-center gap-8 text-foreground">
        <h1 className="text-4xl font-bold">Demo Complete!</h1>
        <p className="text-2xl">Final Score: {score + (isCorrect ? 100 : 0)} pts</p>
        <p className="text-lg text-muted-primary-foreground">{numberOfRounds} rounds played</p>
        <button onClick={resetDemo} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Play Again
        </button>
      </main>
    )
  }

  const hasFinishedGuessing = isCorrect
  const hasFinishedRound = (hasFinishedGuessing && !currentRound.mapId) || (hasFinishedGuessing && currentRound.mapId && hasSubmittedMap)
  const isDisplayGame = hasFinishedRound || isExpired || (isEliminated && config.playersLives)
  const isDisplayTimer = demoMode === "full" && !isDisplayGame
  const isDisplayInput = !isCorrect && !isExpired && !isEliminated
  const isDisplayMap = demoMode === "full" && isCorrect && !isDisplayGame && !isEliminated && currentRound.mapPosition

  return (
    <main className="min-h-full-height relative">
      {isDisplayTimer && <DemoTimer />}
      {isDisplayGame && <DemoDisplay />}

      <DemoRoundInfos />

      {isDisplayInput && <DemoInputGuess />}
      {isDisplayMap && <DemoMapGuess />}

      {currentRound.isSpecial && demoMode === "full" && <DemoSpecialRound />}
      {(!currentRound.isSpecial || demoMode === "simplified") && <DemoNormalRound />}
    </main>
  )
}

export default DemoPlaying
