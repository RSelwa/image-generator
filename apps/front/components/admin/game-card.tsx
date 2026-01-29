import { Badge } from "@/components/ui/badge"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import type { GameEntity } from "@repo/schemas"

const GameCard = ({ game }: { game: GameEntity; index?: number }) => {
  const { openModal } = useModal(MODAL_KEYS.SPHERICAL_GALLERY_ID, game.id)

  return (
    <li className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100">
      <img
        src={game.thumbnailUrl}
        alt={game.title}
        className="size-full object-cover"
      />
      <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
        <Badge asChild variant="blur" className="mr-1">
          <button type="button" onClick={openModal}>
            {game.sphericalsCount} Sphericals
          </button>
        </Badge>
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
    </li>
  )
}

export default GameCard
