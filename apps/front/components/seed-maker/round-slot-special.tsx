"use client"

import { useDroppable } from "@dnd-kit/core"
import { DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import { type Round, type SpecialRoundOption } from "@repo/schemas"
import { Globe, GripVertical, Trash2 } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

type SpecialOptionSlotProps = {
  roundIndex: number
  optionIndex: number
  option: SpecialRoundOption | null
  onClear: () => void
}

const SpecialOptionSlot = ({ roundIndex, optionIndex, option, onClear }: SpecialOptionSlotProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `round-slot-${roundIndex}-option-${optionIndex}`,
    data: { index: roundIndex, optionIndex, isSpecial: true },
  })

  const isEmpty = !option
  const isSpherical = option?.type === ROUND_TYPE.SPHERICAL
  const displayImage = option?.thumbnailUrl || FALL_BACK_IMAGE

  return (
    <div
      ref={setNodeRef}
      className={`relative h-16 overflow-hidden rounded border transition-colors ${isOver ? "border-primary bg-primary/10" : "border-border"} ${isEmpty ? "border-dashed" : ""}`}
    >
      {isEmpty && (
        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
          Option {optionIndex + 1}
        </div>
      )}
      {!isEmpty && (
        <>
          <Image
            src={displayImage}
            alt={option.gameTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 flex items-center justify-between">
            <p className="text-[10px] text-white truncate flex-1">{option.gameTitle}</p>
            <Badge variant="blur" className="text-[8px] px-1 py-0 ml-1">
              {isSpherical && <Globe className="size-2 mr-0.5" />}
              {isSpherical ? "360" : "F"}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-0.5 right-0.5 bg-black/50 rounded p-0.5 text-white hover:bg-black/70 cursor-pointer"
          >
            <Trash2 className="size-2.5" />
          </button>
        </>
      )}
    </div>
  )
}

type RoundSlotSpecialProps = {
  index: number
  round: Round | null
  onClearOption: (optionIndex: number) => void
  onClearAll: () => void
  onDifficultyChange: (difficulty: string) => void
  onToggleSpecial: () => void
  dragHandleProps?: Record<string, unknown>
}

const RoundSlotSpecial = ({
  index,
  round,
  onClearOption,
  onClearAll,
  onDifficultyChange,
  onToggleSpecial,
  dragHandleProps,
}: RoundSlotSpecialProps) => {
  const options = round?.options || [null, null, null, null]

  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
      <div {...dragHandleProps} className="cursor-grab text-muted-foreground shrink-0 mt-1">
        <GripVertical className="size-4" />
      </div>

      <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 text-center mt-1">
        {index + 1}
      </span>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <Badge variant="default" className="text-[10px]">Special Round</Badge>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((optionIndex) => (
            <SpecialOptionSlot
              key={optionIndex}
              roundIndex={index}
              optionIndex={optionIndex}
              option={options[optionIndex] || null}
              onClear={() => onClearOption(optionIndex)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
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

        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onToggleSpecial}
        >
          Special
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearAll}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default RoundSlotSpecial
