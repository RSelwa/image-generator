"use client"

import Image from "next/image"
import { ReactSphere } from "@/components/providers/react-sphere"
import { useGetFlatByIdQuery } from "@/redux/api/flat"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

export const FlatFullScreen = (props: { id: string, gameId: string }) => {
  const { data } = useGetFlatByIdQuery(props)

  console.log(data)

  return (
    <div className="size-full">
      <Image src={data?.image || ""} height={1080} width={1920} alt="Flat Fullscreen" className="size-full object-cover" />
    </div>
  )
}

export const SphericalFullScreen = (props: { id: string, gameId: string }) => {
  const { data } = useGetSphericalByIdQuery(props)

  return (
    <div className="size-full">
      {data?.image && <ReactSphere src={data.image} />}
    </div>
  )
}
