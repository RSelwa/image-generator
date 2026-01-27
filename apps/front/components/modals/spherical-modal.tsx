import { MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"
import { useQueryState } from "nuqs"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

export const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.ID)

  if (!sphericalId) return null
  const { data } = useGetSphericalByIdQuery({ id: sphericalId })

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
  const [gameId] = useQueryState(MODAL_KEYS.ID)

  if (!gameId) return null

  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId })

  if (!data) return null

  return (
    <section className="w-full h-125 grid-cols-2 grid overflow-y-auto gap-3">
      {data.map((spherical) => (
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(spherical.image)}`}
          alt={spherical.id}
          className="aspect-video w-full object-contain"
        />
      ))}
    </section>
  )
}
