"use client"

import { useQueryState } from "nuqs"
import GameCard from "@/components/admin/game-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS, NEW_SEARCH_PARAM, QUERY_PARAMS, SORT_OPTIONS, SORT_OPTIONS_LABEL } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import {
  useGetGamesInfiniteQuery,
  useGetTotalGamesCountQuery,
} from "@/redux/api/games"

const Page = () => {
  const [sort, setSort] = useQueryState(QUERY_PARAMS.SORT, { defaultValue: "" })
  const [search, setSearch] = useQueryState(QUERY_PARAMS.SEARCH, { defaultValue: "" })
  const [displayMissingImages, setDisplayMissingImages] = useQueryState(QUERY_PARAMS.MISSING_IMAGE, { defaultValue: "" })

  const { openModal } = useModal(MODAL_KEYS.GAME_ID, NEW_SEARCH_PARAM)

  const { data: gameCount } = useGetTotalGamesCountQuery()
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useGetGamesInfiniteQuery()

  const games = data?.pages.flat() || []

  const isOnlyDisplayMissingImages = displayMissingImages === "true"

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase()),
  ).filter((game) => {
    if (isOnlyDisplayMissingImages)
      return !game.storageImage

    return true
  }).sort((a, b) => {
    if (sort === SORT_OPTIONS.TITLE_ASC)
      return a.title.localeCompare(b.title)

    if (sort === SORT_OPTIONS.TITLE_DESC)
      return b.title.localeCompare(a.title)

    return 0
  })

  return (
    <main className="p-2 min-h-full-height-admin">
      <header className="py-4 sticky top-0 flex items-center w-full justify-between bg-white z-20">
        <div className="flex items-center justify-end gap-4">
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
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="ghost">
              <FieldGroup className="min-w-48 max-w-max hover:bg-neutral-200">
                <Field orientation="horizontal">
                  <Checkbox id="toggle-only-images" checked={isOnlyDisplayMissingImages} onCheckedChange={(checked) => setDisplayMissingImages(checked ? "true" : "")} />
                  <FieldContent>
                    <FieldLabel htmlFor="toggle-only-images">Only missing images</FieldLabel>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Sort By</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.values(SORT_OPTIONS).map((sortOption) => (
                  <DropdownMenuCheckboxItem
                    key={sortOption}
                    checked={sort === sortOption}
                    onCheckedChange={() => setSort(sortOption)}
                  >
                    {SORT_OPTIONS_LABEL[sortOption]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button onClick={() => openModal()}>Add New Game</Button>
        </div>
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
