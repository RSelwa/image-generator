"use client"

import * as React from "react"
import AdminHeader from "@/components/admin-header"
import { MapCard } from "@/components/cards/map-card"
import { useGetMapsInfiniteQuery } from "@/redux/api/maps"

const Page = () => {
  const { data, isLoading } = useGetMapsInfiniteQuery()

  const maps = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <AdminHeader title="Maps" />

      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
        {maps?.map((map) => (
          <MapCard key={map.id} map={map} gameId={map.gameId} />
        ))}
      </ul>
    </main>
  )
}

export default Page
