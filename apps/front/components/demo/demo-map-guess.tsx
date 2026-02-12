"use client"

import { type FormEvent, useState } from "react"
import * as React from "react"
import { type Position } from "@/components/mini-map"
import MiniMap from "@/components/mini-map"
import { Button } from "@/components/ui/button"
import { useDemoContext } from "@/components/demo/demo-context"

const DemoMapGuess = () => {
  const [playPosition, setPlayerPosition] = useState<Position>({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const { currentRound, submitMapPosition } = useDemoContext()

  if (!currentRound || !currentRound.mapPosition) return null

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitMapPosition(playPosition)
  }

  return (
    <form
      data-testid="demo-map-guess-form"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onSubmit={onSubmit}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
    >
      <p className="w-full bg-background text-foreground rounded-sm py-1 text-center text-shadow text-xl font-semibold">
        {currentRound.gameTitle}
      </p>

      <MiniMap
        mapData={{
          mapImage: currentRound.mapImage || "",
          size: {
            width: currentRound.mapWidth || 0,
            height: currentRound.mapHeight || 0,
          },
          correctPosition: currentRound.mapPosition,
        }}
        showCorrectMarker={false}
        guessPosition={playPosition}
        onMapClick={setPlayerPosition}
        inline
        isParentHover={isHovered}
      />

      <Button data-testid="demo-map-submit" type="submit" className="w-full">
        Guess
      </Button>
    </form>
  )
}

export default DemoMapGuess
