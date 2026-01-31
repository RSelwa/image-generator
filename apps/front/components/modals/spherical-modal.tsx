import { useQueryState } from "nuqs"
import { ReactSphere } from "@/components/providers/react-sphere"
import { MODAL_KEYS } from "@/constants/mapping"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

export const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.SPHERICAL_ID)
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)
  const { data } = useGetSphericalByIdQuery(
    { gameId: gameId || "", id: sphericalId || "" },
    { skip: !sphericalId || !gameId },
  )

  if (!sphericalId || !gameId || !data) return null

  return (
    <section className="w-full h-96">
      <ReactSphere src={data?.storageImage || data?.image} />
    </section>
  )
}
