import { type MapDocWithId } from "@repo/schemas"
import Image from "next/image"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import {
  FALL_BACK_IMAGE,
  MODAL_KEYS,
} from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"

export const MapCard = ({
  map,
  gameId,
}: {
  map: MapDocWithId
  gameId: string
}) => {
  // Build the combined param for editing this map
  const mapParam = buildSubcollectionParam(gameId, map.id)
  const { openModal } = useModal(MODAL_KEYS.MAP_ID, mapParam)
  const { closeModal } = useModal(MODAL_KEYS.MAPS_GALLERY_ID)

  return (
    <div
      onClick={() => {
        openModal()
        closeModal()
      }}
      className="w-full h-48 relative cursor-pointer group overflow-hidden rounded-lg"
    >
      <Image
        src={map.imageUrl || FALL_BACK_IMAGE}
        alt={map.name}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
        <p className="text-primary-foreground text-sm font-medium truncate">{map.name}</p>
      </div>
    </div>
  )
}
