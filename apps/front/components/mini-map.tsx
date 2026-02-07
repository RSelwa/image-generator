"use client"

import { useCallback, useRef, useState } from "react"
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformContext,
} from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"

// Types for the map system
export type Position = {
  x: number // percentage 0-100
  y: number // percentage 0-100
}

export type MapData = {
  mapImage: string
  correctPosition?: Position
  size: { width: number, height: number }
}

// Mini map sizes
const MINI_MAP_COLLAPSED = { width: 250, height: 130 }
const MINI_MAP_EXPANDED = { width: 600, height: 350 }

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
  showCorrectMarker = true,
  showLine = true,
}: {
  guessPosition: Position | null
  correctPosition?: Position
  showCorrectMarker?: boolean
  showLine?: boolean
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
      {/* Line connecting guess to correct position */}
      {showLine && guessPosition && correctPosition && (
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

      {/* Correct position marker */}
      {showCorrectMarker &&
        correctPosition &&
        renderMarker(correctPosition, "green")}

      {/* Guess marker */}
      {guessPosition && renderMarker(guessPosition, "blue")}

    </>
  )
}

export type MiniMapProps = {
  mapData: MapData
  guessPosition: Position | null
  onMapClick: (position: Position) => void
  hasSubmitted?: boolean
  showCorrectMarker?: boolean
  showLine?: boolean
  disabled?: boolean
  collapsedSize?: { width: number, height: number }
  expandedSize?: { width: number, height: number }
  className?: string
  /** When true, the map is rendered inline (relative) instead of fixed positioned */
  inline?: boolean
  /** When inline, always show expanded (no hover to expand) */
  alwaysExpanded?: boolean
  isParentHover?: boolean
  displayControls?: boolean
}

// Mini Map Component (bottom-right, expands on hover)
export const MiniMap = ({
  mapData,
  guessPosition,
  onMapClick,
  hasSubmitted = false,
  showCorrectMarker = true,
  showLine = true,
  disabled = false,
  collapsedSize = MINI_MAP_COLLAPSED,
  expandedSize = MINI_MAP_EXPANDED,
  className,
  inline = false,
  alwaysExpanded = false,
  isParentHover = false,
  displayControls = false
}: MiniMapProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isHoveredOrParent = isHovered || isParentHover

  const isExpanded = alwaysExpanded || isHoveredOrParent
  const currentSize = isExpanded ? expandedSize : collapsedSize

  // Calculate minimum scale so image always fills the container
  const minScale = Math.max(
    currentSize.width / mapData.size.width,
    currentSize.height / mapData.size.height,
  )

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || hasSubmitted || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      onMapClick({ x, y })
    },
    [disabled, hasSubmitted, onMapClick],
  )

  return (
    <div
      className={`${inline ? "relative" : "fixed bottom-6 right-6 z-50"} rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl transition-all bg-neutral-950/90 duration-300 ease-out ${className ?? ""}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TransformWrapper
        initialScale={minScale}
        minScale={minScale}
        maxScale={4}
        centerOnInit
        panning={{ disabled: !isExpanded }}
        doubleClick={{ disabled: true }}
      >
        {displayControls && <ZoomControls isExpanded={isExpanded} />}
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* Map container with markers - uses actual image dimensions */}
          <div
            ref={containerRef}
            className={`relative ${disabled || hasSubmitted ? "cursor-default" : "cursor-crosshair"}`}
            onClick={handleMapClick}
            style={{
              width: mapData.size.width,
              height: mapData.size.height,
            }}
          >
            {/* Map image */}
            <img
              src={mapData.mapImage}
              alt="Map"
              className="size-full"
              draggable={false}
            />

            {/* Markers layer - needs to be inside TransformWrapper context */}
            <MarkersLayer
              guessPosition={guessPosition}
              correctPosition={mapData.correctPosition}
              showCorrectMarker={showCorrectMarker && hasSubmitted}
              showLine={showLine && hasSubmitted}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default MiniMap
