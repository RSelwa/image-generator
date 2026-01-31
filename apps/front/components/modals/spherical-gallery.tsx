import { type SphericalDocWithId } from "@repo/schemas"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { ModalBase } from "@/components/modals/base"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MODAL_KEYS, NEW_SEARCH_PARAM, STATUS_TO_BADGE_VARIANT } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetGameByIdQuery, useGetMapsByGameIdQuery, useGetSphericalsByGameIdQuery } from "@/redux/api/games"

export const SphericalCard = ({
  spherical,
  gameId,
}: {
  spherical: SphericalDocWithId
  gameId: string
}) => {
  const { data: game } = useGetGameByIdQuery({ id: gameId })
  const { data: maps } = useGetMapsByGameIdQuery({ gameId })
  const sphericalParam = buildSubcollectionParam(gameId, spherical.id)
  const mapParam = buildSubcollectionParam(gameId, spherical.mapId || NEW_SEARCH_PARAM)

  const { openModal: openSphericalIdModal } = useModal(MODAL_KEYS.SPHERICAL_ID, sphericalParam)
  const { openModal: openMapIdModal } = useModal(MODAL_KEYS.MAP_ID, mapParam)
  const { closeModal } = useModal(MODAL_KEYS.SPHERICAL_GALLERY_ID)

  const hasGameMaps = maps && maps.length > 0

  const openMapModal = () => {
    openMapIdModal()
    closeModal()
  }

  return (
    <div className="group relative w-full cursor-pointer overflow-hidden rounded-lg">
      <Image loading="lazy" src={spherical.image} alt={spherical.id} width={300} height={300} className="object-cover w-full h-70 group-hover:hidden" />
      <div className="h-70 group-hover:block hidden">
        <ReactSphere src={spherical.image} />
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <Badge variant={STATUS_TO_BADGE_VARIANT[spherical.status]}> {spherical.status} </Badge>
        {!hasGameMaps && <Badge variant="destructive" onClick={openMapModal}> No map </Badge>}
        {!spherical.mapId && <Badge variant="red"> No map Selected </Badge>}
        {!spherical.mapPosition && <Badge variant="red"> Need map position </Badge>}
      </div>
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-2 left-2 invisible group-hover:visible transition-all"
        onClick={() => {
          openSphericalIdModal()
          closeModal()
        }}
      >
        <Pencil className="size-4" />
      </Button>
      {game && (
        <div className="absolute w-36 bottom-2 right-2 flex-col items-end text-right">
          <Image
            src={game.image || ""}
            height={100}
            width={100}
            alt={game.title}
            className="w-full max-h-20 aspect-auto object-cover rounded-lg"
          />
          <span className="mt-1 text-sm font-medium text-white drop-shadow-lg">{game.title}</span>
        </div>
      )}
    </div>
  )
}

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
