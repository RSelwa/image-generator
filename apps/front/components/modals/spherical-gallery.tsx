import { ModalBase } from "@/components/modals/base"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import {
  useDeleteSphericalMutation
} from "@/redux/api/spherical"
import { SphericalDocWithId } from "@repo/schemas"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { useState } from "react"

const SphericalCard = ({spherical}: {spherical: SphericalDocWithId}) => {


    return (
         <div
              data-selected={false}
              data-has-selected={false}
              className="relative w-full aspect-video data-[selected=true]:border-2 data-[has-selected=true]:cursor-pointer border-red-500"
            >
              <Tooltip>
  <TooltipTrigger asChild><Image
                src={`/api/proxy-image?url=${encodeURIComponent(spherical.image)}`}
                alt={spherical.id}
                className="size-full object-cover"
                width={110}
                height={90}
              /></TooltipTrigger>
  <TooltipContent className="h-70 aspect-video" sideOffset={0} hideArrow>
    <ReactSphere src={spherical.storageImage || spherical.image} />
  </TooltipContent>
</Tooltip>
              
            </div>
    )
}

export const SphericalGalleryModal = () => {
  const [selectedId, setSelectedId] = useState<string[]>([])
  const [gameId] = useQueryState(MODAL_KEYS.SPHERICAL_GALLERY_ID)
  const [deleteSpherical, { isLoading }] = useDeleteSphericalMutation()

  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" })

  if (!data || !gameId) return null

  const hasSelected = selectedId.length > 0

  const deleteSelectedSphericals = async () => {
    await Promise.all(selectedId.map((id) => deleteSpherical({ gameId, id })))

    setSelectedId([])
  }

  return (
    <ModalBase className="h-125" modalKey={MODAL_KEYS.SPHERICAL_GALLERY_ID}>
      <div className="grid-cols-2 grid gap-3 overflow-y-auto h-100">
        {data.map((spherical) => {
          

          return (
           <SphericalCard
                spherical={spherical} 
              key={spherical.id}
            />
          )
        })}
      </div>
      <Separator className="my-4 mt-full" />
    </ModalBase>
  )
}
