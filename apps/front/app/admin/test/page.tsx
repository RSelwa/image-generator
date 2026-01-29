"use client"

import { Button } from "@/components/ui/button"
import { useCallback, useRef, useState } from "react"
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformContext,
} from "react-zoom-pan-pinch"

// Types for the map guessing system
interface Position {
  x: number // percentage 0-100
  y: number // percentage 0-100
}

interface MapRound {
  mapImage: string
  correctPosition: Position
  size: { width: number; height: number }
}

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

// Mini map sizes
const MINI_MAP_COLLAPSED = { width: 250, height: 130 }
const MINI_MAP_EXPANDED = { width: 600, height: 350 }

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

// Zoom controls component
const ZoomControls = ({ isExpanded }: { isExpanded: boolean }) => {
  const { zoomIn, zoomOut, resetTransform } = useControls()

  if (!isExpanded) return null

  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
      <Button size="sm" variant="secondary" onClick={() => zoomIn()}>
        +
      </Button>
      <Button size="sm" variant="secondary" onClick={() => zoomOut()}>
        -
      </Button>
      <Button size="sm" variant="secondary" onClick={() => resetTransform()}>
        Reset
      </Button>
    </div>
  )
}

// Markers layer - contains all markers and uses transform context for scale
const MarkersLayer = ({
  guessPosition,
  correctPosition,
  hasSubmitted,
}: {
  guessPosition: Position | null
  correctPosition: Position
  hasSubmitted: boolean
}) => {
  const { transformState } = useTransformContext()
  const scale = transformState.scale

  const renderMarker = (position: Position, color: "blue" | "green") => {
    const bgColor = color === "blue" ? "bg-blue-500" : "bg-green-500"
    const borderColor =
      color === "blue" ? "border-t-blue-500" : "border-t-green-500"

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -100%) scale(${1 / scale})`,
          transformOrigin: "bottom center",
        }}
      >
        <div className="relative">
          <div
            className={`size-4 rounded-full ${bgColor} border-2 border-white shadow-lg`}
          />
          <div
            className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent ${borderColor}`}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Correct position marker - always visible */}
      {renderMarker(correctPosition, "green")}

      {/* Guess marker */}
      {guessPosition && renderMarker(guessPosition, "blue")}

      {/* Line connecting guess to correct position (shown after submit) */}
      {hasSubmitted && guessPosition && (
        <svg
          className="absolute inset-0 size-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <line
            x1={`${guessPosition.x}%`}
            y1={`${guessPosition.y}%`}
            x2={`${correctPosition.x}%`}
            y2={`${correctPosition.y}%`}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={2 / scale}
            strokeDasharray={`${6 / scale},${3 / scale}`}
          />
        </svg>
      )}
    </>
  )
}

// Mini Map Component (bottom-right, expands on hover)
const MiniMap = ({
  mapRound,
  guessPosition,
  hasSubmitted,
  onMapClick,
}: {
  mapRound: MapRound
  guessPosition: Position | null
  hasSubmitted: boolean
  onMapClick: (position: Position) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentSize = isExpanded ? MINI_MAP_EXPANDED : MINI_MAP_COLLAPSED

  // Calculate minimum scale so image always fills the container
  const minScale = Math.max(
    currentSize.width / mapRound.size.width,
    currentSize.height / mapRound.size.height,
  )

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasSubmitted || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      onMapClick({ x, y })
    },
    [hasSubmitted, onMapClick],
  )

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl transition-all duration-300 ease-out"
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <TransformWrapper
        initialScale={minScale}
        minScale={minScale}
        maxScale={4}
        centerOnInit
        panning={{ disabled: !isExpanded }}
        doubleClick={{ disabled: true }}
      >
        <ZoomControls isExpanded={isExpanded} />
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* Map container with markers - uses actual image dimensions */}
          <div
            ref={containerRef}
            className="relative cursor-crosshair"
            onClick={handleMapClick}
            style={{
              width: mapRound.size.width,
              height: mapRound.size.height,
            }}
          >
            {/* Map image */}
            <img
              src={mapRound.mapImage}
              alt="Map"
              className="size-full"
              draggable={false}
            />

            {/* Markers layer - needs to be inside TransformWrapper context */}
            <MarkersLayer
              guessPosition={guessPosition}
              correctPosition={mapRound.correctPosition}
              hasSubmitted={hasSubmitted}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
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
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Map Guesser</h1>
          <p className="text-xl mb-2">
            Round {currentRound + 1} of {EXAMPLE_ROUNDS.length}
          </p>
          <p className="text-2xl font-semibold">Score: {totalScore}</p>

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
        mapRound={currentMap}
        guessPosition={guessPosition}
        hasSubmitted={hasSubmitted}
        onMapClick={handleMapClick}
      />

      {/* Submit button - fixed bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {hasSubmitted && guessPosition && (
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-center">
            <p>
              Distance:{" "}
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
            <p className="text-white text-xl font-bold">
              Game Over! Final Score: {totalScore}/
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

const Page = () => {
  return <MapGuesser />
}

export default Page
