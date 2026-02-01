import { useQueryState } from "nuqs"
import FlatCard from "@/components/cards/flat-card"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { Button } from "@/components/ui/button"
import {
  MODAL_KEYS,
  NEW_SEARCH_PARAM,
} from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetFlatsByGameIdQuery } from "@/redux/api/flat"
import {
  useGetGameByIdQuery,
} from "@/redux/api/games"

const key = MODAL_KEYS.FLAT_GALLERY_ID

export const FlatsGallery = () => {
  const [gameId] = useQueryState(key)

  const { closeModal } = useModal(key)
  const { openModal: openNewMapModal } = useModal(MODAL_KEYS.FLAT_ID)

  const { data: game } = useGetGameByIdQuery({ id: gameId || "" }, { skip: !gameId })
  const { data: flats } = useGetFlatsByGameIdQuery(
    { gameId: gameId || "" },
    { skip: !gameId },
  )

  if (!gameId) return <LoadingModal modalKey={key} />

  // Build the combined param for creating a new map
  const newMapParam = buildSubcollectionParam(gameId, NEW_SEARCH_PARAM)
  const hasFlats = flats && flats.length > 0

  return (
    <ModalBase className="max-h-125" modalKey={key}>
      <header className="flex items-center max-h-12 justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2>
            Flats of <span className="underline">{game?.title}</span>
          </h2>
        </div>
        <Button
          onClick={() => {
            openNewMapModal(newMapParam)
            closeModal()
          }}
        >
          New Flats
        </Button>
      </header>
      <section className="grid grid-cols-2 gap-4">
        {!hasFlats && (
          <p className="text-center col-span-2">
            No maps available for this game.
          </p>
        )}
        {hasFlats &&
          flats.map((flat) => <FlatCard key={flat.id} flat={flat} gameId={gameId} />)}
      </section>
    </ModalBase>
  )
}
