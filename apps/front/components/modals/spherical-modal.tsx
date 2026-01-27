import { Button } from "@/components/ui/button"
import { MODAL_ACTION_VALUES, MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"
import { Pen } from "lucide-react"
import { useQueryState } from "nuqs"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

export const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.SPHERICAL_ID)
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)

  if (!sphericalId || !gameId) return null
  const { data } = useGetSphericalByIdQuery({ gameId, id: sphericalId })

  if (!data) return null

  const img = `/api/proxy-image?url=${encodeURIComponent(data?.image)}`
  return (
    <section className="w-full h-96" style={{ backgroundImage: img }}>
      <ReactPhotoSphereViewer
        hideNavbarButton={true}
        navbar={false}
        canvasBackground={img}
        src={img}
        height={"100%"}
        width={"100%"}
      />
    </section>
  )
}

export const SphericalGalleryModal = () => {
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)
  const [action, setAction] = useQueryState(MODAL_KEYS.MODAL_ACTION)

  if (!gameId) return null

  const { data } = useGetSphericalsByGameIdQuery({ gameId })

  if (!data) return null

  const isDelete = action === MODAL_ACTION_VALUES.DELETE

  return (
    <section className="relative w-full h-125 grid-cols-2 grid overflow-y-auto gap-3">
      {data.map((spherical) => (
        <div key={spherical.id} className="relative w-full aspect-video">
          <img
            src={`/api/proxy-image?url=${encodeURIComponent(spherical.image)}`}
            alt={spherical.id}
            className="size-full object-cover"
          />
          {isDelete && (
            <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md">
              Delete
            </div>
          )}
        </div>
      ))}

      {!isDelete && (
        <Button
          variant="destructive"
          className="fixed z-50 top-2 right-12"
          onClick={() => setAction(MODAL_ACTION_VALUES.DELETE)}
        >
          <Pen />
        </Button>
      )}
    </section>
  )
}
