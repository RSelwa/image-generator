import Image from "next/image"
import { useQueryState } from "nuqs"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { Button } from "@/components/ui/button"
import {
  FALL_BACK_IMAGE,
  MODAL_KEYS,
  NEW_SEARCH_PARAM,
} from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import {
  useGetGameByIdQuery,
  useGetMapsByGameIdQuery,
} from "@/redux/api/games"

export function MapsGallery() {
  const [gameId] = useQueryState(MODAL_KEYS.MAPS_GALLERY_ID)
  const { closeModal } = useModal(MODAL_KEYS.MAPS_GALLERY_ID)
  const { openModal: openNewMapModal } = useModal(MODAL_KEYS.MAP_ID)
  const { data: game } = useGetGameByIdQuery(
    { id: gameId ?? "" },
    { skip: !gameId },
  )
  const { data: maps } = useGetMapsByGameIdQuery(
    { gameId: gameId ?? "" },
    { skip: !gameId },
  )

  if (!gameId) return <LoadingModal modalKey={MODAL_KEYS.MAPS_GALLERY_ID} />

  // Build the combined param for creating a new map
  const newMapParam = buildSubcollectionParam(gameId, NEW_SEARCH_PARAM)
  const hasMaps = maps && maps.length > 0

  return (
    <ModalBase className="h-125" modalKey={MODAL_KEYS.MAPS_GALLERY_ID}>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2>
            Maps of <span className="underline">{game?.title}</span>
          </h2>
        </div>
        <Button
          onClick={() => {
            openNewMapModal(newMapParam)
            closeModal()
          }}
        >
          New Map
        </Button>
      </header>
      <section className="grid grid-cols-2 gap-4">
        {!hasMaps && (
          <p className="text-center col-span-2">
            No maps available for this game.
          </p>
        )}
        {hasMaps &&
          maps.map((map) => <MapCard key={map.id} map={map} gameId={gameId} />)}
      </section>
    </ModalBase>
  )
}

function MapCard({
  map,
  gameId,
}: {
  map: { id: string, name: string, imageUrl?: string | null }
  gameId: string
}) {
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
        <p className="text-white text-sm font-medium truncate">{map.name}</p>
      </div>
    </div>
  )
}
