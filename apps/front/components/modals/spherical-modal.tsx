import { MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalByIdQuery } from "@/redux/api/admin"
import { useQueryState } from "nuqs"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.ID)

  if (!sphericalId) return null
  const { data } = useGetSphericalByIdQuery({ id: sphericalId })

  if (!data) return null

  return (
    <section className="w-full h-96">
      <ReactPhotoSphereViewer
        hideNavbarButton={true}
        navbar={false}
        src={`/api/proxy-image?url=${encodeURIComponent(data?.image)}`}
        height={"100%"}
        width={"100%"}
      />
    </section>
  )
}

export default SphericalModal
