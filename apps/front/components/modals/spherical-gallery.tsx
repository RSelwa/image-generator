import { type SphericalDocWithId } from "@repo/schemas"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { ModalBase } from "@/components/modals/base"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"

function SphericalCard({
  spherical,
  gameId,
}: {
  spherical: SphericalDocWithId
  gameId: string
}) {
  const sphericalParam = buildSubcollectionParam(gameId, spherical.id)
  const { openModal } = useModal(MODAL_KEYS.SPHERICAL_ID, sphericalParam)
  const { closeModal } = useModal(MODAL_KEYS.SPHERICAL_GALLERY_ID)

  const externalImage = `/api/proxy-image?url=${encodeURIComponent(spherical.image)}`
  const src = spherical.storageImage || externalImage

  return (
    <div className="group relative w-full aspect-video cursor-pointer overflow-hidden rounded-lg">
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src={src}
            alt={spherical.id}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </TooltipTrigger>
        <TooltipContent className="h-70 aspect-video" sideOffset={0} hideArrow>
          <ReactSphere src={spherical.storageImage || spherical.image} />
        </TooltipContent>
      </Tooltip>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">
          {spherical.difficulty}
        </p>
      </div>
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          openModal()
          closeModal()
        }}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  )
}

export function SphericalGalleryModal() {
  const [gameId] = useQueryState(MODAL_KEYS.SPHERICAL_GALLERY_ID)

  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" })

  if (!data || !gameId) return null

  return (
    <ModalBase className="h-125" modalKey={MODAL_KEYS.SPHERICAL_GALLERY_ID}>
      <div className="grid-cols-2 grid gap-3 overflow-y-auto h-100">
        {data.map((spherical) => {
          return (
            <SphericalCard
              spherical={spherical}
              gameId={gameId}
              key={spherical.id}
            />
          )
        })}
      </div>
      <Separator className="my-4 mt-full" />
    </ModalBase>
  )
}
