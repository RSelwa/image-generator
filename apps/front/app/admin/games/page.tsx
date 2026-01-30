"use client"

import GameCard from "@/components/admin/game-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import {
  useGetGamesInfiniteQuery,
  useGetTotalGamesCountQuery,
} from "@/redux/api/games"
import { useState } from "react"

const Page = () => {
  const [search, setSearch] = useState("")
  const { data: gameCount } = useGetTotalGamesCountQuery()
  const { openModal } = useModal(MODAL_KEYS.GAME_ID, NEW_SEARCH_PARAM)
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useGetGamesInfiniteQuery({
      search,
    })

  const games = data?.pages.flat() || []

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="p-2 min-h-full-height-admin">
      <header className="py-4 sticky top-0 flex items-center w-full justify-between bg-white z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold whitespace-nowrap">
            Games {gameCount && `(${gameCount})`}
          </h1>
          <Input
            type="search"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openModal}>Add New Game</Button>
      </header>

      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
        {filteredGames?.map((game) => (
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
