import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { FALL_BACK_IMAGE, MODAL_KEYS } from "@/constants/mapping"
import { useGetGameByIdQuery, useGetMapsByGameIdQuery } from "@/redux/api/games"
import Image from "next/image"
import { useQueryState } from "nuqs"

type Props = {}

export const MapsGallery = (props: Props) => {
  const [gameId] = useQueryState(MODAL_KEYS.MAPS_GALLERY_ID)

  if (!gameId) return <LoadingModal modalKey={MODAL_KEYS.MAPS_GALLERY_ID} />

  const {data: game } = useGetGameByIdQuery({id: gameId}) 

  const {data:maps} = useGetMapsByGameIdQuery({gameId})
const hasMaps = maps && maps.length > 0

  return (
    <ModalBase className="h-125" modalKey={MODAL_KEYS.MAPS_GALLERY_ID}><header className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">

      <h2>Maps of {" "} 
        <span className="underline">
        {game?.title}
        </span>
        </h2>
      </div>
      <Button disabled={!hasMaps} >New Maps</Button>
      </header>
      <section className="grid grid-cols-2 gap-4">
        {!hasMaps && ( 
          <p className="text-center">No maps available for this game.</p>
         )}
         {
          hasMaps && maps.map((map) => (
            <div key={map.id} className="w-full h-48 relative">
              <Image
                src={map.imageUrl||FALL_BACK_IMAGE}
                alt={`Map ${map.id}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))
         }
        </section></ModalBase>
  )
}
