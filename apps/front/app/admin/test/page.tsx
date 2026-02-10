"use client"

import { useCallback, useState } from "react"
import { type MapData, MiniMap, type Position } from "@/components/mini-map"
import { Button } from "@/components/ui/button"

type MapRound = {
  correctPosition: Position
} & MapData

// Example map data - replace with your actual maps
const EXAMPLE_ROUNDS: MapRound[] = [
  {
    mapImage: "/map.png",
    correctPosition: { x: 50, y: 50 }, // Center of the map
    size: {
      width: 1300,
      height: 1521,
    },
  },
]

const MAX_POINTS = 5000

// Calculate distance between two positions (in percentage units)
const calculateDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y

  return Math.sqrt(dx * dx + dy * dy)
}

// Calculate points based on distance (exponential decay)
const calculatePoints = (distance: number): number => {
  if (distance < 1) return MAX_POINTS
  // Exponential decay: closer = more points
  const points = MAX_POINTS * Math.exp(-distance / 15)

  return Math.round(Math.max(0, points))
}

const MapGuesser = () => {
  const [currentRound, setCurrentRound] = useState(0)
  const [guessPosition, setGuessPosition] = useState<Position | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])

  const currentMap = EXAMPLE_ROUNDS[currentRound]

  const handleMapClick = useCallback(
    (position: Position) => {
      if (hasSubmitted) return
      setGuessPosition(position)
    },
    [hasSubmitted],
  )

  const handleSubmit = () => {
    if (!guessPosition) return

    const distance = calculateDistance(
      guessPosition,
      currentMap.correctPosition,
    )
    const points = calculatePoints(distance)

    setRoundScores([...roundScores, points])
    setTotalScore(totalScore + points)
    setHasSubmitted(true)
  }

  const handleNextRound = () => {
    if (currentRound < EXAMPLE_ROUNDS.length - 1) {
      setCurrentRound(currentRound + 1)
      setGuessPosition(null)
      setHasSubmitted(false)
    }
  }

  const handleReset = () => {
    setCurrentRound(0)
    setGuessPosition(null)
    setHasSubmitted(false)
    setTotalScore(0)
    setRoundScores([])
  }

  const isGameOver = currentRound === EXAMPLE_ROUNDS.length - 1 && hasSubmitted

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Main game area - this would be your panorama/image view */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground text-center">
          <h1 className="text-4xl font-bold mb-4">Map Guesser</h1>
          <p className="text-xl mb-2">
            Round {currentRound + 1} of {EXAMPLE_ROUNDS.length}
          </p>
          <p className="text-2xl font-semibold">
            Score:
            {totalScore}
          </p>

          {/* Placeholder for panorama view */}
          <div className="mt-8 p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <p className="text-gray-400">Panorama / Image view goes here</p>
            <p className="text-gray-500 text-sm mt-2">
              Hover the mini-map in the bottom-right to expand it
            </p>
          </div>
        </div>
      </div>

      {/* Mini Map - fixed bottom right */}
      <MiniMap
        mapData={currentMap}
        guessPosition={guessPosition}
        hasSubmitted={hasSubmitted}
        onMapClick={handleMapClick}
      />

      {/* Submit button - fixed bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {hasSubmitted && guessPosition && (
          <div className="bg-primary/80 text-foreground px-4 py-2 rounded-lg text-center">
            <p>
              Distance:
              {" "}
              {calculateDistance(
                guessPosition,
                currentMap.correctPosition,
              ).toFixed(1)}
              %
            </p>
            <p className="text-xl font-bold text-green-400">
              +{roundScores[currentRound]} points
            </p>
          </div>
        )}

        {!hasSubmitted ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!guessPosition}
            className="px-8"
          >
            Submit Guess
          </Button>
        ) : isGameOver ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground text-xl font-bold">
              Game Over! Final Score:
              {" "}
              {totalScore}
              /
              {MAX_POINTS * EXAMPLE_ROUNDS.length}
            </p>
            <Button size="lg" onClick={handleReset}>
              Play Again
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={handleNextRound}>
            Next Round
          </Button>
        )}
      </div>
    </div>
  )
}

const Page = () => <MapGuesser />

export default Page
