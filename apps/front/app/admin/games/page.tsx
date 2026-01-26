"use client"

import { Button } from "@/components/ui/button"
import { useGetGamesInfiniteQuery } from "@/redux/api/admin"
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

      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {games?.map((game) => (
          <li
            key={game.id}
            className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100"
          >
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              className="size-full object-cover"
            />
            <div className="absolute inset-x-0 flex h-1/2 w-full -translate-y-full flex-col justify-end p-2 text-white">
              <div
                style={{
                  WebkitBackdropFilter: "blur(4px)",
                  maskImage:
                    "linear-gradient(to top, black 20%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 20%, transparent 100%)",
                }}
                className="pointer-events-none absolute top-0 left-0 size-full bg-black/40 backdrop-blur-xs"
              />
              <div className="relative z-10">
                <h2 className="flex max-w-full items-center gap-1 text-lg font-semibold capitalize">
                  <span className="shrink truncate">{game.title}</span>
                </h2>
              </div>
            </div>
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
