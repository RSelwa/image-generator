"use client"

import { ReactSphere } from "@/components/providers/react-sphere"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

export const SphericalFullScreen = (props: { id: string, gameId: string }) => {
  const { data } = useGetSphericalByIdQuery(props)

  return (
    <div className="size-full">
      {data?.image && <ReactSphere src={data.image} />}
    </div>
  )
}
