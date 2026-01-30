import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { FALL_BACK_IMAGE, MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetGameByIdQuery, useGetMapsByGameIdQuery } from "@/redux/api/games"
import Image from "next/image"
import { useQueryState } from "nuqs"

export const MapsGallery = () => {
  const [gameId] = useQueryState(MODAL_KEYS.MAPS_GALLERY_ID)
  const { openModal: openNewMapModal } = useModal(MODAL_KEYS.MAP_ID, NEW_SEARCH_PARAM)

  if (!gameId) return <LoadingModal modalKey={MODAL_KEYS.MAPS_GALLERY_ID} />

  const { data: game } = useGetGameByIdQuery({ id: gameId })
  const { data: maps } = useGetMapsByGameIdQuery({ gameId })
  const hasMaps = maps && maps.length > 0

  return (
    <ModalBase className="h-125" modalKey={MODAL_KEYS.MAPS_GALLERY_ID}>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2>
            Maps of{" "}
            <span className="underline">{game?.title}</span>
          </h2>
        </div>
        <Button onClick={openNewMapModal}>New Map</Button>
      </header>
      <section className="grid grid-cols-2 gap-4">
        {!hasMaps && (
          <p className="text-center col-span-2">No maps available for this game.</p>
        )}
        {hasMaps &&
          maps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
      </section>
    </ModalBase>
  )
}

const MapCard = ({ map }: { map: { id: string; name: string; imageUrl?: string | null } }) => {
  const { openModal } = useModal(MODAL_KEYS.MAP_ID, map.id)

  return (
    <div
      onClick={openModal}
      className="w-full h-48 relative cursor-pointer group overflow-hidden rounded-lg"
    >
      <Image
        src={map.imageUrl || FALL_BACK_IMAGE}
        alt={map.name}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">{map.name}</p>
      </div>
    </div>
  )
}
