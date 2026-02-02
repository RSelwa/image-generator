"use client"

import * as React from "react"
import AdminHeader from "@/components/admin-header"
import FlatCard from "@/components/cards/flat-card"
import { useGetFlatsInfiniteQuery } from "@/redux/api/flat"

const Page = () => {
  const { data, isLoading } = useGetFlatsInfiniteQuery()

  const flats = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <AdminHeader title="Flats" />
      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
        {flats?.map((flat) => (
          <FlatCard key={flat.id} flat={flat} gameId={flat.gameId} />
        ))}
      </ul>
    </main>
  )
}

export default Page
