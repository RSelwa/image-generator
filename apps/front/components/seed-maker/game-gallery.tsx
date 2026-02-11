"use client"

import { RefreshCcw, Search } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { FALL_BACK_IMAGE } from "@/constants/mapping"
import { useGetSeedMakerGamesQuery } from "@/redux/api/seed-maker"

type GameGalleryProps = {
  onSelectGame: (gameId: string, gameTitle: string, gameImage: string) => void
}

const GameGallery = ({ onSelectGame }: GameGalleryProps) => {
  const [search, setSearch] = useState("")
  const { data: games, isLoading, refetch } = useGetSeedMakerGamesQuery()

  const filteredGames = (games || []).filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-3 h-full">
      <InputGroup className="relative">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupButton onClick={async () => await refetch()}>
          <RefreshCcw className="size-4" />
        </InputGroupButton>
      </InputGroup>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 overflow-y-auto">
        {isLoading && Array.from({ length: 28 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 rounded-lg border border-border hover:border-primary" />
        ))}
        {!isLoading && filteredGames.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelectGame(game.id, game.title, game.image)}
            className="relative h-28 cursor-pointer overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Image
              src={game.image || FALL_BACK_IMAGE}
              alt={game.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
              <p className="text-xs text-white font-medium truncate">{game.title}</p>
            </div>
          </button>
        ))}

      </div>

      {!isLoading && filteredGames.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">No games found</p>
      )}
    </div>
  )
}

export default GameGallery
