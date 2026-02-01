import { useQueryState } from "nuqs"
import { SphericalCard } from "@/components/cards/spherical-card"
import { ModalBase } from "@/components/modals/base"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"

export const SphericalGalleryModal = () => {
  const [gameId] = useQueryState(MODAL_KEYS.SPHERICAL_GALLERY_ID)

  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" })

  if (!data || !gameId) return null

  return (
    <ModalBase className="h-125 overflow-y-auto pb-0" modalKey={MODAL_KEYS.SPHERICAL_GALLERY_ID}>
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
      <div className="sticky bottom-0 pb-4 w-full bg-white">
        <Separator className="my-4 mt-full" />
        <Button>Test</Button>
      </div>
    </ModalBase>
  )
}
