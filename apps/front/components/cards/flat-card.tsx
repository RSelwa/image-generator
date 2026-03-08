import { type FlatDocWithId } from "@repo/schemas"
import { PenIcon } from "lucide-react"
import Image from "next/image"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MODAL_KEYS, RESOURCE_BADGE_VARIANT } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"

const FlatCard = ({
  flat,
  gameId,
}: {
  flat: FlatDocWithId
  gameId: string
}) => {
  // Build the combined param for editing this map
  const mapParam = buildSubcollectionParam(gameId, flat.id)
  const { openModal } = useModal(MODAL_KEYS.FLAT_ID, mapParam)
  const { closeModal } = useModal(MODAL_KEYS.FLAT_GALLERY_ID)

  const shouldDisplayNoThumbnailOrMapBadge = !flat.thumbnail && !flat.mapId
  const shouldDisplayNoPositionBadge = Boolean(flat.mapId) && !flat.mapPosition
  const hasThumbnail = Boolean(flat.thumbnail)
  const hasMap = Boolean(flat.mapId)

  return (
    <section className="group relative w-full cursor-pointer overflow-hidden rounded-lg">
      <Image loading="lazy" src={flat.image} alt={flat.id} width={300} height={300} className="object-cover aspect-video size-full" />
      {flat.thumbnail && <Image loading="lazy" src={flat.thumbnail} alt={flat.id} width={100} height={100} className="object-cover rounded shadow-2xl drop-shadow-xl/50 aspect-square size-12 absolute right-2 bottom-2" />}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        {shouldDisplayNoThumbnailOrMapBadge && <Badge variant="red">No thumbnail or map</Badge>}
        {shouldDisplayNoPositionBadge && <Badge variant="red">No position</Badge>}
        {hasThumbnail && <Badge variant={RESOURCE_BADGE_VARIANT.THUMBNAIL}>Thumbnail</Badge>}
        {hasMap && <Badge variant={RESOURCE_BADGE_VARIANT.MAP}>Map</Badge>}
      </div>

      <article className="absolute bottom-2 left-2 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            openModal()
            closeModal()
          }}
          className="group-hover:bg-white/50"
        >
          <PenIcon className="size-4" />
        </Button>
      </article>
    </section>
  )
}

export default FlatCard
