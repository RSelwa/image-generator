"use client"

import Image from "next/image"
import { ReactSphere } from "@/components/providers/react-sphere"
import { FALL_BACK_IMAGE } from "@/constants/mapping"
import { useGetFlatByIdQuery } from "@/redux/api/flat"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

export const FlatFullScreen = (props: { id: string, gameId: string }) => {
  const { data } = useGetFlatByIdQuery(props)

  return (
    <div className="size-full">
      <Image src={data?.image || FALL_BACK_IMAGE} height={1080} width={1920} alt="Flat Fullscreen" className="size-full object-cover" />
    </div>
  )
}

export const SphericalFullScreen = (props: { id: string, gameId: string }) => {
  const { data } = useGetSphericalByIdQuery(props)

  return (
    <div className="h-full-height w-full">
      {data?.image && <ReactSphere src={data.image} hideCursor />}
    </div>
  )
}
