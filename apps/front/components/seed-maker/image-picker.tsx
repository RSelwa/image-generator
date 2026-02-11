"use client"

import { DEFAULT_MAX_DISTANCE_POINTS, ROUND_TYPE } from "@repo/common"
import { ArrowLeft } from "lucide-react"
import DraggableImageCard, { type DragData } from "@/components/seed-maker/draggable-image-card"
import { Button } from "@/components/ui/button"
import { useGetGameReadyDataQuery } from "@/redux/api/seed-maker"

type ImagePickerProps = {
  gameId: string
  gameTitle: string
  gameImage: string
  onBack: () => void
}

const ImagePicker = ({ gameId, gameTitle, gameImage, onBack }: ImagePickerProps) => {
  const { data, isLoading } = useGetGameReadyDataQuery({ gameId })

  const sphericals = data?.sphericals || []
  const flats = data?.flats || []
  const maps = data?.maps || []

  const getMapById = (mapId: string | undefined) => {
    if (!mapId) return null

    return maps.find((m) => m.id === mapId) || null
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <h3 className="font-medium text-sm truncate">{gameTitle}</h3>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading images...</p>}

      {!isLoading && sphericals.length === 0 && flats.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">No ready images for this game</p>
      )}

      {sphericals.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sphericals ({sphericals.length})
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1.5">
            {sphericals.map((spherical) => {
              const map = getMapById(spherical.mapId)
              const dragData: DragData = {
                type: ROUND_TYPE.SPHERICAL,
                imageId: spherical.id,
                image: spherical.image || "",
                thumbnail: spherical.thumbnail || "",
                gameId,
                gameTitle,
                gameImage,
                mapId: spherical.mapId || null,
                mapPosition: spherical.mapPosition || null,
                mapImage: map?.imageUrl || null,
                mapWidth: map?.width || null,
                mapHeight: map?.height || null,
                maxDistancePoints: map?.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
              }

              return (
                <DraggableImageCard
                  key={spherical.id}
                  id={`spherical-${spherical.id}`}
                  data={dragData}
                />
              )
            })}
          </div>
        </div>
      )}

      {flats.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Flats ({flats.length})
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1.5">
            {flats.map((flat) => {
              const map = getMapById(flat.mapId)
              const dragData: DragData = {
                type: ROUND_TYPE.FLAT,
                imageId: flat.id,
                image: flat.image || "",
                thumbnail: flat.thumbnail || "",
                gameId,
                gameTitle,
                gameImage,
                mapId: flat.mapId || null,
                mapPosition: flat.mapPosition || null,
                mapImage: map?.imageUrl || null,
                mapWidth: map?.width || null,
                mapHeight: map?.height || null,
                maxDistancePoints: map?.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
              }

              return (
                <DraggableImageCard
                  key={flat.id}
                  id={`flat-${flat.id}`}
                  data={dragData}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImagePicker
