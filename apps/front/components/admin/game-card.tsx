import { Badge } from "@/components/ui/badge"
import { FALL_BACK_IMAGE, MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import type { GameEntity } from "@repo/schemas"
import Image from "next/image"
const GameCard = ({ game }: { game: GameEntity; index?: number }) => {
  const { openModal: openGallery } = useModal(
    MODAL_KEYS.SPHERICAL_GALLERY_ID,
    game.id,
  )
  const { openModal: openMapsGallery } = useModal(
    MODAL_KEYS.MAPS_GALLERY_ID,
    game.id,
  )
  const { openModal } = useModal(MODAL_KEYS.GAME_ID, game.id)

  return (
    <div
      onClick={openModal}
      className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100"
    >
      <Image
        src={game.thumbnailUrl || FALL_BACK_IMAGE}
        alt={game.title}
        height={200}
        loading="eager"
        width={400}
        className="size-full object-cover"
      />
      <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">

        <Badge asChild variant="blur" className="mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openGallery()
            }}
            className="cursor-pointer"
          >
            {game.sphericalsCount} Sphericals
          </button>
        </Badge>
        <Badge asChild variant="blur" className="mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openMapsGallery()
            }}
            className="cursor-pointer"
          >
            {game.mapsCount} Maps
          </button>
        </Badge>
        </div>

      </div>
      <div className="absolute inset-x-0 flex h-1/2 w-full -translate-y-full flex-col justify-end p-2 text-white">
        <div
          style={{
            WebkitBackdropFilter: "blur(4px)",
            maskImage: "linear-gradient(to top, black 20%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 20%, transparent 100%)",
          }}
          className="pointer-events-none absolute top-0 left-0 size-full bg-black/40 backdrop-blur-xs"
        />
        <div className="relative z-10">
          <h2 className="flex max-w-full items-center gap-1 text-lg font-semibold capitalize">
            <span className="shrink truncate">{game.title}</span>
          </h2>
        </div>
      </div>
    </div>
  )
}

export default GameCard
