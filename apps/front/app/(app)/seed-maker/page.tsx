"use client"

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DEFAULT_MAX_DISTANCE_POINTS,
  DEFAULT_NUMBERS_ROUNDS,
  DIFFICULTIES,
  NUMBER_OF_ROUNDS_PER_STAGE,
  ROUND_TYPE,
} from "@repo/common"
import { type Round, roundSchema, type SpecialRoundOption } from "@repo/schemas"
import { memo, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import z from "zod"
import { type DragData } from "@/components/seed-maker/draggable-image-card"
import GameGallery from "@/components/seed-maker/game-gallery"
import ImagePicker from "@/components/seed-maker/image-picker"
import RoundSlot from "@/components/seed-maker/round-slot"
import RoundSlotSpecial from "@/components/seed-maker/round-slot-special"
import SeedMakerHeader from "@/components/seed-maker/seed-maker-header"
import { useCreateManualSeedMutation } from "@/redux/api/seed-maker"

type SelectedGame = {
  id: string
  title: string
  image: string
  alternateNames: string[]
}

type SortableRoundProps = {
  id: string
  index: number
  round: Round | null
  isSpecial: boolean
  onClear: (index: number) => void
  onClearOption: (roundIndex: number, optionIndex: number) => void
  onDifficultyChange: (index: number, difficulty: string) => void
  onToggleSpecial: (index: number) => void
}

const SortableRound = memo(({
  id,
  index,
  round,
  isSpecial,
  onClear,
  onClearOption,
  onDifficultyChange,
  onToggleSpecial,
}: SortableRoundProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dragHandleProps = { ...attributes, ...listeners }

  const boundClear = useCallback(() => onClear(index), [onClear, index])
  const boundClearOption = useCallback((optionIndex: number) => onClearOption(index, optionIndex), [onClearOption, index])
  const boundDifficultyChange = useCallback((d: string) => onDifficultyChange(index, d), [onDifficultyChange, index])
  const boundToggleSpecial = useCallback(() => onToggleSpecial(index), [onToggleSpecial, index])

  return (
    <div ref={setNodeRef} style={style}>
      {isSpecial && (
        <RoundSlotSpecial
          index={index}
          round={round}
          onClearOption={boundClearOption}
          onClearAll={boundClear}
          onDifficultyChange={boundDifficultyChange}
          onToggleSpecial={boundToggleSpecial}
          dragHandleProps={dragHandleProps}
        />
      )}
      {!isSpecial && (
        <RoundSlot
          index={index}
          round={round}
          onClear={boundClear}
          onDifficultyChange={boundDifficultyChange}
          onToggleSpecial={boundToggleSpecial}
          isSpecial={isSpecial}
          dragHandleProps={dragHandleProps}
        />
      )}
    </div>
  )
})

const buildNormalRound = (data: DragData): Round => ({
  isSpecial: false,
  type: data.type,
  gameId: data.gameId,
  gameTitle: data.gameTitle,
  gameAlternateNames: data.gameAlternateNames,
  gameThumbnailUrl: data.gameImage,
  sphericalId: data.type === ROUND_TYPE.SPHERICAL ? data.imageId : null,
  sphericalImageUrl: data.type === ROUND_TYPE.SPHERICAL ? data.image : null,
  flatId: data.type === ROUND_TYPE.FLAT ? data.imageId : null,
  flatImageUrl: data.type === ROUND_TYPE.FLAT ? data.image : null,
  mapId: data.mapId || null,
  mapPosition: data.mapPosition || null,
  mapImage: data.mapImage || null,
  mapWidth: data.mapWidth || null,
  mapHeight: data.mapHeight || null,
  maxDistancePoints: data.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
  options: null,
  difficulty: DIFFICULTIES.EASY,
})

const buildSpecialOption = (data: DragData): SpecialRoundOption => ({
  type: data.type,
  gameId: data.gameId,
  gameTitle: data.gameTitle,
  gameAlternateNames: data.gameAlternateNames,
  gameThumbnailUrl: data.gameImage,
  thumbnailUrl: data.thumbnail || data.image,
  sphericalId: data.type === ROUND_TYPE.SPHERICAL ? data.imageId : null,
  sphericalImage: data.type === ROUND_TYPE.SPHERICAL ? data.image : null,
  flatId: data.type === ROUND_TYPE.FLAT ? data.imageId : null,
  flatImage: data.type === ROUND_TYPE.FLAT ? data.image : null,
})

const Page = () => {
  const [name, setName] = useState("")
  const [roundCount, setRoundCount] = useState(DEFAULT_NUMBERS_ROUNDS)
  const [hasSpecialRounds, setHasSpecialRounds] = useState(false)
  const [rounds, setRounds] = useState<(Round | null)[]>(() =>
    Array.from({ length: DEFAULT_NUMBERS_ROUNDS }, () => null),
  )
  const [specialFlags, setSpecialFlags] = useState<boolean[]>(() =>
    Array.from({ length: DEFAULT_NUMBERS_ROUNDS }, () => false),
  )
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const [createSeed, { isLoading: isSaving }] = useCreateManualSeedMutation()

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const roundIds = useMemo(() => rounds.map((_, i) => `sortable-round-${i}`), [rounds.length])

  const handleRoundCountChange = (count: number) => {
    setRoundCount(count)
    setRounds((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, () => null)]
      }

      return prev.slice(0, count)
    })
    setSpecialFlags((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, () => false)]
      }

      return prev.slice(0, count)
    })
  }

  const handleHasSpecialRoundsChange = (value: boolean) => {
    setHasSpecialRounds(value)
    if (value) {
      setSpecialFlags((prev) =>
        prev.map((_, i) => (i + 1) % NUMBER_OF_ROUNDS_PER_STAGE === 0),
      )
      setRounds((prev) =>
        prev.map((round, i) => {
          if ((i + 1) % NUMBER_OF_ROUNDS_PER_STAGE === 0) {
            return round ? { ...round, isSpecial: true, options: round.options || null } : null
          }

          return round ? { ...round, isSpecial: false } : null
        }),
      )
    } else {
      setSpecialFlags((prev) => prev.map(() => false))
      setRounds((prev) =>
        prev.map((round) => (round ? { ...round, isSpecial: false, options: null } : null)),
      )
    }
  }

  const handleToggleSpecial = useCallback((index: number) => {
    setSpecialFlags((prev) => {
      const next = [...prev]
      next[index] = !next[index]

      return next
    })
    setRounds((prev) => {
      const next = [...prev]
      const round = next[index]
      if (round) {
        next[index] = { ...round, isSpecial: !round.isSpecial, options: !round.isSpecial ? (round.options || null) : null }
      }

      return next
    })
  }, [])

  const handleClearRound = useCallback((index: number) => {
    setRounds((prev) => {
      const next = [...prev]
      next[index] = null

      return next
    })
  }, [])

  const handleClearOption = useCallback((roundIndex: number, optionIndex: number) => {
    setRounds((prev) => {
      const next = [...prev]
      const round = next[roundIndex]
      if (round?.options) {
        const newOptions = [...round.options]
        newOptions[optionIndex] = null as unknown as SpecialRoundOption

        next[roundIndex] = { ...round, options: newOptions }
      }

      return next
    })
  }, [])

  const handleDifficultyChange = useCallback((index: number, difficulty: string) => {
    setRounds((prev) => {
      const next = [...prev]
      const round = next[index]
      if (round) {
        next[index] = { ...round, difficulty: difficulty as Round["difficulty"] }
      }

      return next
    })
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event

    if (!over) return

    const overId = String(over.id)

    // Handle sortable round reordering
    if (overId.startsWith("sortable-round-") && String(active.id).startsWith("sortable-round-")) {
      const oldIndex = roundIds.indexOf(String(active.id))
      const newIndex = roundIds.indexOf(overId)
      if (oldIndex !== newIndex) {
        setRounds((prev) => arrayMove(prev, oldIndex, newIndex))
        setSpecialFlags((prev) => arrayMove(prev, oldIndex, newIndex))
      }

      return
    }

    // Handle image drop onto round slot
    const dragData = active.data.current as DragData | undefined
    if (!dragData) return

    const dropData = over.data.current as { index: number, optionIndex?: number, isSpecial?: boolean } | undefined
    if (!dropData) return

    const { index: roundIndex, optionIndex, isSpecial } = dropData

    if (isSpecial && optionIndex !== undefined) {
      // Drop onto special round option
      const option = buildSpecialOption(dragData)
      setRounds((prev) => {
        const next = [...prev]
        const round = next[roundIndex]
        const currentOptions = round?.options || [null, null, null, null]
        const newOptions = [...currentOptions]
        newOptions[optionIndex] = option

        next[roundIndex] = {
          ...(round || {}),
          isSpecial: true,
          options: newOptions as Round["options"],
          difficulty: round?.difficulty || DIFFICULTIES.EASY,
        } as Round

        return next
      })
    } else {
      // Drop onto normal round slot
      const newRound = buildNormalRound(dragData)
      setRounds((prev) => {
        const next = [...prev]
        next[roundIndex] = newRound

        return next
      })
    }
  }, [roundIds])

  const handleSave = async () => {
    const validRounds = rounds.filter((r) => {
      if (!r) return false
      if (r.isSpecial) {
        return r.options?.every((o) => o && o.gameId) || false
      }

      return !!(r.sphericalId || r.flatId)
    })

    if (validRounds.length === 0) {
      toast.error("Please add at least one round")

      return
    }

    try {
      const rounds = z.array(roundSchema).parse(validRounds)
      const result = await createSeed({ name, rounds }).unwrap()
      toast.success(`Seed created successfully! ID: ${result.seedId}`)
      setName("")
      setRounds(Array.from({ length: roundCount }, () => null))
      setSpecialFlags(Array.from({ length: roundCount }, () => false))
      setHasSpecialRounds(false)
    } catch (error) {
      console.error("Error creating seed:", error)
      toast.error("Failed to create seed")
    }
  }

  const filledRoundsCount = rounds.filter((r) => {
    if (!r) return false
    if (r.isSpecial) return r.options?.some((o) => o && o.gameId) || false

    return !!(r.sphericalId || r.flatId)
  }).length

  const isValid = filledRoundsCount > 0

  return (
    <main className="flex flex-col h-full-height">
      <SeedMakerHeader
        name={name}
        onNameChange={setName}
        roundCount={roundCount}
        onRoundCountChange={handleRoundCountChange}
        hasSpecialRounds={hasSpecialRounds}
        onHasSpecialRoundsChange={handleHasSpecialRoundsChange}
        onSave={handleSave}
        isSaving={isSaving}
        isValid={isValid}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 min-h-0">
          {/* Left Panel - Data Browser */}
          <div className="w-2/5 border-r p-3 overflow-y-auto">
            {!selectedGame && (
              <GameGallery
                onSelectGame={(id, title, image, alternateNames) =>
                  setSelectedGame({ id, title, image, alternateNames })}
              />
            )}
            {selectedGame && (
              <ImagePicker
                gameId={selectedGame.id}
                gameTitle={selectedGame.title}
                gameImage={selectedGame.image}
                gameAlternateNames={selectedGame.alternateNames}
                onBack={() => setSelectedGame(null)}
              />
            )}
          </div>

          {/* Right Panel - Round Builder */}
          <div className="w-3/5 p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {filledRoundsCount}/{roundCount} rounds filled
              </p>
            </div>

            <SortableContext items={roundIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {rounds.map((round, index) => (
                  <SortableRound
                    key={roundIds[index]}
                    id={roundIds[index]}
                    index={index}
                    round={round}
                    isSpecial={specialFlags[index]}
                    onClear={handleClearRound}
                    onClearOption={handleClearOption}
                    onDifficultyChange={handleDifficultyChange}
                    onToggleSpecial={handleToggleSpecial}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeDragId && (
            <div className="h-14 w-20 rounded bg-primary/20 border border-primary flex items-center justify-center text-xs">
              Moving...
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </main>
  )
}

export default Page
