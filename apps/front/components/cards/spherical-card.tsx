import { type SphericalDocWithId } from "@repo/schemas"
import { Pencil, SquareArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MODAL_KEYS, NEW_SEARCH_PARAM, STATUS_TO_BADGE_VARIANT } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useModal } from "@/hooks/use-modal"
import { useGetGameByIdQuery, useGetMapsByGameIdQuery } from "@/redux/api/games"

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
    <section className="group relative w-full cursor-pointer overflow-hidden rounded-lg">
      <Image loading="lazy" src={spherical.image} alt={spherical.id} width={300} height={300} className="object-cover aspect-video size-full group-hover:hidden" />
      <div className="h-full aspect-video group-hover:block hidden">
        <ReactSphere src={spherical.image} />
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <Badge variant={STATUS_TO_BADGE_VARIANT[spherical.status]}> {spherical.status} </Badge>
        {!hasGameMaps && <Badge variant="destructive" onClick={openMapModal}> No map </Badge>}
        {!spherical.mapId && <Badge variant="red"> No map Selected </Badge>}
        {!spherical.mapPosition && <Badge variant="red"> Need map position </Badge>}
      </div>
      <article className="absolute bottom-2 left-2 flex items-center gap-2 invisible group-hover:visible transition-all">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => {
            openSphericalIdModal()
            closeModal()
          }}
        >
          <Pencil className="size-4" />
        </Button>
        <Button variant="secondary" asChild><Link href={`${PAGES.ADMIN_SPHERICAL_FULLSCREEN}/${gameId}/${spherical.id}`}target="_blank"><SquareArrowUpRight className="size-4" /></Link></Button>
      </article>

      {game && (
        <div className="absolute w-36 group-hover:w-16 bottom-2 right-2 flex-col items-end text-right">
          <Image
            src={game.image || ""}
            height={100}
            width={100}
            alt={game.title}
            className="w-full max-h-20 group-hover:max-h-12 aspect-auto object-cover rounded-lg"
          />
          <span className="mt-1 text-sm font-medium text-foreground drop-shadow-lg">{game.title}</span>
        </div>
      )}
    </section>
  )
}
