"use client"

import * as React from "react"
import { useDemoContext } from "@/components/demo/demo-context"

const DemoRoundInfos = () => {
  const { currentRound, currentRoundIndex, numberOfRounds, score, stage } = useDemoContext()

  if (!currentRound) return null

  return (
    <div className="absolute z-10 top-4 right-8 flex flex-col items-end pr-8 text-foreground text-shadow-primary text-shadow">
      <p>Stage: {stage}</p>
      <p>Level: {currentRoundIndex + 1}/{numberOfRounds}</p>
      <p>Your score: {score} pts</p>
    </div>
  )
}

export default DemoRoundInfos
