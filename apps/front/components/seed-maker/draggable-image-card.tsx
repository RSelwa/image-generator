"use client"

import { useDraggable } from "@dnd-kit/core"
import { ROUND_TYPE } from "@repo/common"
import { Globe, Map } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

export type DragData = {
  type: typeof ROUND_TYPE.SPHERICAL | typeof ROUND_TYPE.FLAT
  imageId: string
  image: string
  thumbnail: string
  gameId: string
  gameTitle: string
  gameAlternateNames: string[]
  gameImage: string
  mapId: string | null
  mapPosition: { x: number, y: number } | null
  mapImage: string | null
  mapWidth: number | null
  mapHeight: number | null
  maxDistancePoints: number | null
}

type DraggableImageCardProps = {
  id: string
  data: DragData
}

export const DraggableSkeleton = () => (<Skeleton className="h-28 rounded-md border border-border" />)

const DraggableImageCard = ({ id, data }: DraggableImageCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  })

  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  const isSpherical = data.type === ROUND_TYPE.SPHERICAL
  const hasMap = !!data.mapId
  const displayImage = data.thumbnail || data.image || FALL_BACK_IMAGE

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative z-50 h-28 cursor-grab overflow-hidden rounded-md border border-border hover:border-primary transition-colors ${isDragging ? "opacity-50 z-50" : ""}`}
    >
      <Image
        src={displayImage}
        alt={`${data.type} image`}
        fill
        className="object-cover"
      />
      <div className="absolute inset-x-0 top-0 flex gap-1 p-1">
        <Badge variant="blur" className="text-[10px] px-1.5 py-0">
          {isSpherical && (
            <>
              <Globe className="size-3 mr-0.5" />
              360
            </>
          )}
          {!isSpherical && "Flat"}
        </Badge>
        {hasMap && (
          <Badge variant="blur" className="text-[10px] px-1.5 py-0">
            <Map className="size-3" />
          </Badge>
        )}
      </div>
    </div>
  )
}

export default DraggableImageCard
