import { MODAL_KEYS, MODAL_TYPES_VALUES } from "@/constants/mapping"
import type { GameEntity } from "@repo/schemas"
import { useQueryState } from "nuqs"

const GameCard = ({ game, index }: { game: GameEntity; index?: number }) => {
  const [, setModalGameId] = useQueryState(MODAL_KEYS.GAME_ID)
  const [, setModalType] = useQueryState(MODAL_KEYS.MODAL_TYPE)

  const openSphericalsModal = () => {
    setModalGameId(game.id)
    setModalType(MODAL_TYPES_VALUES.SPHERICAL_GALLERY)
  }

  return (
    <li className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100">
      <img
        src={game.thumbnailUrl}
        alt={game.title}
        className="size-full object-cover"
      />
      <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={openSphericalsModal}
          className="inline-flex h-6 items-center rounded-full px-2 align-middle text-xs leading-none focus:outline-hidden uppercase border border-grey-100 bg-transparent backdrop-blur-sm text-neutral-100"
        >
          {game.sphericalsCount} Sphericals
        </button>
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
      <span className="absolute top-3 right-3">{index}</span>
    </li>
  )
}

export default GameCard
