"use client"

import { useCallback, useRef, useState } from "react"
import {
  type ReactZoomPanPinchRef
} from "react-zoom-pan-pinch"
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformContext,
} from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

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
const MINI_MAP_COLLAPSED_MOBILE = { width: 200, height: 100 }
const MINI_MAP_EXPANDED_MOBILE = { width: 375, height: 275 }
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
        data-testid={`marker-${color}`}
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
            className={`size-4 rounded-full ${bgColor} border-2 border-primary-foreground shadow-lg`}
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
          data-testid="marker-line"
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
  displayControls = false,
  ...props
}: MiniMapProps) => {
  const isMobile = useIsMobile()
  const [isHovered, setIsHovered] = useState(false)
  const wrapperClickRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const mouseDownPos = useRef<{ x: number, y: number } | null>(null)
  const touchStartPos = useRef<{ x: number, y: number } | null>(null)

  const isHoveredOrParent = isHovered || isParentHover

  const isExpanded = alwaysExpanded || isHoveredOrParent
  const currentSize = isMobile ? (isExpanded ? MINI_MAP_EXPANDED_MOBILE : MINI_MAP_COLLAPSED_MOBILE) :(isExpanded ? expandedSize : collapsedSize)

  // Calculate minimum scale so image always fills the container
  const minScale = Math.max(
    currentSize.width / mapData.size.width,
    currentSize.height / mapData.size.height,
  )

  const handleTransitionEnd = useCallback(() => {
    transformRef.current?.centerView(minScale, 0)
  }, [minScale])

  const DRAG_THRESHOLD = 5

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (disabled || hasSubmitted || !wrapperClickRef.current || !transformRef.current) return
      if (e.changedTouches.length !== 1) return

      const touch = e.changedTouches[0]

      if (touchStartPos.current) {
        const dx = touch.clientX - touchStartPos.current.x
        const dy = touch.clientY - touchStartPos.current.y
        if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return
      }

      const wrapperRect = wrapperClickRef.current.getBoundingClientRect()
      const clickX = touch.clientX - wrapperRect.left
      const clickY = touch.clientY - wrapperRect.top

      const { scale, positionX, positionY } = transformRef.current.instance.transformState

      const mapX = (clickX - positionX) / scale
      const mapY = (clickY - positionY) / scale

      const x = (mapX / mapData.size.width) * 100
      const y = (mapY / mapData.size.height) * 100

      onMapClick({ x, y })
    },
    [disabled, hasSubmitted, onMapClick, mapData.size.width, mapData.size.height],
  )

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || hasSubmitted || !wrapperClickRef.current || !transformRef.current) return

      if (mouseDownPos.current) {
        const dx = e.clientX - mouseDownPos.current.x
        const dy = e.clientY - mouseDownPos.current.y
        if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return
      }

      const wrapperRect = wrapperClickRef.current.getBoundingClientRect()
      const clickX = e.clientX - wrapperRect.left
      const clickY = e.clientY - wrapperRect.top

      const { scale, positionX, positionY } = transformRef.current.instance.transformState

      const mapX = (clickX - positionX) / scale
      const mapY = (clickY - positionY) / scale

      const x = (mapX / mapData.size.width) * 100
      const y = (mapY / mapData.size.height) * 100

      onMapClick({ x, y })
    },
    [disabled, hasSubmitted, onMapClick, mapData.size.width, mapData.size.height],
  )

  return (
    <div
      data-testid="mini-map-container"
      ref={wrapperClickRef}
      className={`${inline ? "relative" : "fixed bottom-6 right-6 z-50"} rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl transition-all bg-neutral-950/90 duration-300 ease-out ${disabled || hasSubmitted ? "cursor-default" : "cursor-crosshair"} ${className ?? ""}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTransitionEnd={handleTransitionEnd}
      onMouseDown={handleMouseDown}
      onClick={handleMapClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      <TransformWrapper
        ref={transformRef}
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
            className="relative"
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
