"use client"

import { useQueryState } from "nuqs"
import AdminHeader from "@/components/admin-header"
import { SphericalCard } from "@/components/cards/spherical-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { QUERY_PARAMS, SORT_OPTIONS, SORT_OPTIONS_LABEL } from "@/constants/mapping"
import { useGetSphericalsInfiniteQuery } from "@/redux/api/spherical"

const Page = () => {
  const [sort, setSort] = useQueryState(QUERY_PARAMS.SORT, { defaultValue: "" })
  const [displayMissingImages, setDisplayMissingImages] = useQueryState(QUERY_PARAMS.MISSING_IMAGE, { defaultValue: "" })

  const { data, isLoading, hasNextPage, fetchNextPage } = useGetSphericalsInfiniteQuery()

  const isOnlyDisplayMissingImages = displayMissingImages === "true"

  const sphericals = data?.pages.flat() || []

  const filteredSphericals = sphericals.filter((spherical) => {
    if (isOnlyDisplayMissingImages)
      return !spherical.image || !spherical.mapPosition

    return true
  })

  return (
    <main className="p-2 h-full-height-admin">
      <AdminHeader title="Sphericals">
        <div className="flex items-center gap-2 shrink-0">
          <FieldGroup className="min-w-40">
            <Field orientation="horizontal" className=" rounded px-4 py-2 cursor- max-w-max hover:bg-neutral-200">

              <Checkbox id="toggle-only-images" checked={isOnlyDisplayMissingImages} onCheckedChange={(checked) => setDisplayMissingImages(checked ? "true" : "")} />
              <FieldContent>
                <FieldLabel htmlFor="toggle-only-images">Only invalids</FieldLabel>
              </FieldContent>

            </Field>
          </FieldGroup>

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
      </AdminHeader>
      {isLoading && <p>Loading...</p>}

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
        {filteredSphericals.map((spherical) => <SphericalCard key={spherical.id} spherical={spherical} gameId={spherical.gameId} />)}
      </ul>

      {hasNextPage && (
        <Button disabled={isLoading} onClick={fetchNextPage} className="mx-auto my-8 w-full">
          Load more
        </Button>
      )}
    </main>
  )
}

export default Page
