import { useQueryState } from "nuqs"
import { SphericalCard } from "@/components/cards/spherical-card"
import { LoadingModal, ModalBase } from "@/components/modals/base"

import { buildSubcollectionParam } from "@/components/modals/map-id"
import { Button } from "@/components/ui/button"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetGameByIdQuery, useGetSphericalsByGameIdQuery } from "@/redux/api/games"

const key = MODAL_KEYS.SPHERICAL_GALLERY_ID

export const SphericalGalleryModal = () => {
  const [gameId] = useQueryState(MODAL_KEYS.SPHERICAL_GALLERY_ID)

  const { closeModal } = useModal(key)
  const { openModal: openNewSphericalModal } = useModal(MODAL_KEYS.EDIT_SPHERICAL_ID)

  const { data: game } = useGetGameByIdQuery({ id: gameId || "" }, { skip: !gameId })
  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" })

  if (!gameId) return <LoadingModal modalKey={key} />

  const newMapParam = buildSubcollectionParam(gameId, NEW_SEARCH_PARAM)

  if (!data || !gameId) return null

  return (
    <ModalBase className="max-h-125 overflow-y-auto" modalKey={MODAL_KEYS.SPHERICAL_GALLERY_ID}>
      <header className="flex items-center max-h-12 justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2>
            Sphericals of <span className="underline">{game?.title}</span>
          </h2>
        </div>
        <Button
          onClick={() => {
            openNewSphericalModal(newMapParam)
            closeModal()
          }}
        >
          New Spherical
        </Button>
      </header>
      <div className="grid-cols-2 grid gap-3">
        {data.map((spherical) => (
          <SphericalCard
            spherical={spherical}
            gameId={gameId}
            key={spherical.id}
          />
        )
        )}
      </div>
    </ModalBase>
  )
}
