"use client"

import { DEFAULT_MAX_DISTANCE_POINTS, ROUND_TYPE } from "@repo/common"
import { ArrowLeft } from "lucide-react"
import DraggableImageCard, { type DragData, DraggableSkeleton } from "@/components/seed-maker/draggable-image-card"
import { Button } from "@/components/ui/button"
import { useGetGameReadyDataQuery } from "@/redux/api/seed-maker"

type ImagePickerProps = {
  gameId: string
  gameTitle: string
  gameImage: string
  gameAlternateNames: string[]
  onBack: () => void
}

const ImagePicker = ({ gameId, gameTitle, gameImage, gameAlternateNames, onBack }: ImagePickerProps) => {
  const { data, isLoading } = useGetGameReadyDataQuery({ gameId })

  const sphericals = data?.sphericals || []
  const flats = data?.flats || []
  const maps = data?.maps || []

  const getMapById = (mapId: string | undefined) => {
    if (!mapId) return null

    return maps.find((m) => m.id === mapId) || null
  }

  const allImages = [
    ...sphericals.map((s) => ({ ...s, type: ROUND_TYPE.SPHERICAL as typeof ROUND_TYPE.SPHERICAL })),
    ...flats.map((f) => ({ ...f, type: ROUND_TYPE.FLAT as typeof ROUND_TYPE.FLAT })),
  ]

  const withMap = allImages.filter((img) => !!img.mapId)
  const withThumbnail = allImages.filter((img) => !img.mapId)

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <h3 className="font-medium text-sm truncate">{gameTitle}</h3>
      </div>

      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5">
          { Array.from({ length: 24 }).map((_, idx) => (
            <DraggableSkeleton key={idx} />
          ))}
        </div>
      )}

      {!isLoading && allImages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">No ready images for this game</p>
      )}

      {withMap.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            With Map ({withMap.length})
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5">
            {withMap.map((img) => {
              const map = getMapById(img.mapId)
              const dragData: DragData = {
                type: img.type,
                imageId: img.id,
                image: img.image || "",
                thumbnail: img.thumbnail || "",
                gameId,
                gameTitle,
                gameAlternateNames,
                gameImage,
                mapId: img.mapId || null,
                mapPosition: img.mapPosition || null,
                mapImage: map?.imageUrl || null,
                mapWidth: map?.width || null,
                mapHeight: map?.height || null,
                maxDistancePoints: map?.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
              }

              return (
                <DraggableImageCard
                  key={img.id}
                  id={`${img.type}-${img.id}`}
                  data={dragData}
                />
              )
            })}
          </div>
        </div>
      )}

      {withThumbnail.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Thumbnail ({withThumbnail.length})
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5">
            {withThumbnail.map((img) => {
              const dragData: DragData = {
                type: img.type,
                imageId: img.id,
                image: img.image || "",
                thumbnail: img.thumbnail || "",
                gameId,
                gameTitle,
                gameAlternateNames,
                gameImage,
                mapId: null,
                mapPosition: null,
                mapImage: null,
                mapWidth: null,
                mapHeight: null,
                maxDistancePoints: DEFAULT_MAX_DISTANCE_POINTS,
              }

              return (
                <DraggableImageCard
                  key={img.id}
                  id={`${img.type}-${img.id}`}
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
