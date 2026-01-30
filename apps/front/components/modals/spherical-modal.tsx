import { ReactSphere } from "@/components/providers/react-sphere"
import { MODAL_KEYS } from "@/constants/mapping"
import {
  useGetSphericalByIdQuery
} from "@/redux/api/spherical"
import { useQueryState } from "nuqs"

export const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.SPHERICAL_ID)
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)

  if (!sphericalId || !gameId) return null
  const { data } = useGetSphericalByIdQuery({ gameId, id: sphericalId })

  if (!data) return null

  return (
    <section className="w-full h-96">
      <ReactSphere src={data?.storageImage || data?.image} />
    </section>
  )
}

