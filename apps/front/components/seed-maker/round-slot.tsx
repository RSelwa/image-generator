"use client"

import { useDroppable } from "@dnd-kit/core"
import { DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import { type Round } from "@repo/schemas"
import { Globe, GripVertical, Map, Trash2 } from "lucide-react"
import Image from "next/image"
import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

type RoundSlotProps = {
  index: number
  round: Round | null
  onClear: () => void
  onDifficultyChange: (difficulty: string) => void
  onToggleSpecial: () => void
  isSpecial: boolean
  dragHandleProps?: Record<string, unknown>
}

const RoundSlot = memo(({
  index,
  round,
  onClear,
  onDifficultyChange,
  onToggleSpecial,
  isSpecial,
  dragHandleProps,
}: RoundSlotProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `round-slot-${index}`,
    data: { index, isSpecial: false },
  })

  const isEmpty = !round || (!round.sphericalId && !round.flatId)
  const isSpherical = round?.type === ROUND_TYPE.SPHERICAL
  const displayImage = isSpherical ? round?.sphericalImageUrl || FALL_BACK_IMAGE : round?.flatImageUrl || FALL_BACK_IMAGE

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${isOver ? "border-primary bg-primary/10" : "border-border"} ${isEmpty ? "border-dashed" : ""}`}
    >
      <div {...dragHandleProps} className="cursor-grab text-muted-foreground shrink-0">
        <GripVertical className="size-4" />
      </div>

      <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 text-center">
        {index + 1}
      </span>

      {isEmpty && (
        <div className="flex-1 flex items-center justify-center h-14 text-sm text-muted-foreground">
          {isSpecial ? "Toggle off special to drop here" : "Drop an image here"}
        </div>
      )}

      {!isEmpty && (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
            <Image
              src={displayImage}
              alt={round?.gameTitle || "Round image"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{round?.gameTitle}</p>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {isSpherical && <Globe className="size-3 mr-0.5" />}
                {isSpherical ? "360" : "Flat"}
              </Badge>
              {round?.mapId && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <Map className="size-3 mr-0.5" />
                  Map
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {!isSpecial && !isEmpty && (
          <Select
            value={round?.difficulty || DIFFICULTIES.EASY}
            onValueChange={onDifficultyChange}
          >
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DIFFICULTIES).map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant={isSpecial ? "marathon" : "marathon-outline"}
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onToggleSpecial}
        >
          Special
        </Button>

        {!isEmpty && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
})

export default RoundSlot
