"use client"

import GameCard from "@/components/admin/game-card"
import { Button } from "@/components/ui/button"
import {
  useGetGamesInfiniteQuery,
  useGetTotalGamesCountQuery,
} from "@/redux/api/games"
import { useState } from "react"

const Page = () => {
  const [search, setSearch] = useState("")
  const { data: gameCount } = useGetTotalGamesCountQuery()
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useGetGamesInfiniteQuery({
      search,
    })

  const games = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <h1>Games {gameCount && `(${gameCount})`}</h1>
      <input
        type="search"
        placeholder="Search games..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {games?.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </ul>
      {hasNextPage && (
        <Button disabled={isLoading} onClick={fetchNextPage}>
          Load more
        </Button>
      )}
    </main>
  )
}

export default Page
