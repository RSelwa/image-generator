"use client"

import { Button } from "@/components/ui/button"
import { useGetGamesInfiniteQuery } from "@/redux/api/admin"
import { getImageUrl } from "@repo/common"
import { useState } from "react"

const Page = () => {
  const [search, setSearch] = useState("")
  const { data, isLoading, fetchNextPage } = useGetGamesInfiniteQuery({
    search,
  })

  const games = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <h1>Games</h1>
      <input
        type="search"
        placeholder="Search games..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="grid grid-cols-5">
        {isLoading && <li>Loading...</li>}
        {games?.map((game) => (
          <li key={game.id}>
            <img
              src={getImageUrl(game.thumbnailUrl)}
              alt={game.title}
              width={100}
            />
            <span>{game.title}</span>
          </li>
        ))}
      </ul>
      <Button disabled={isLoading} onClick={fetchNextPage}>
        Load more
      </Button>
    </main>
  )
}

export default Page
