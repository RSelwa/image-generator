"use client"

import { PlusIcon, RefreshCcw, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { SphericalRow } from "@/app/(app)/admin/sphericals/row"
import SphericalSheet from "@/components/sheet/spherical-sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useDeleteSphericalMutation, useGetSphericalsInfiniteQuery } from "@/redux/api/spherical"

const Page = () => {
  const { openModal } = useModal(MODAL_KEYS.SPHERICAL_ID, `${NEW_SEARCH_PARAM}_${NEW_SEARCH_PARAM}`)

  const [deleteSpherical] = useDeleteSphericalMutation()
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, refetch } = useGetSphericalsInfiniteQuery()

  const [input, setInput] = useState("")
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  const sphericals = data?.pages.flat() || []
  const filteredSphericals = sphericals.filter((spherical) => spherical.id.includes(input) || spherical.game?.title?.toLowerCase().includes(input.toLowerCase()))

  const hasChecked = checkedIds.length > 0
  const isAllChecked = filteredSphericals.length > 0 && filteredSphericals.every((s) => checkedIds.includes(s.id))

  const toggleAllChecked = (value: boolean) => {
    setCheckedIds(value ? filteredSphericals.map((s) => s.id) : [])
  }

  const deleteSphericals = async () => {
    await Promise.all(checkedIds
      .map((id) => sphericals.find((s) => s.id === id))
      .filter((spherical) => spherical !== undefined)
      .map((spherical) => deleteSpherical({ gameId: spherical.gameId, id: spherical.id })),
    )
    setCheckedIds([])
  }


  if (!sphericals.length && !isLoading) {
    return (
      <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
        <section className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">Sphericals</h1>
        </section>
        <div className="flex items-center justify-center h-5/6">
          No sphericals found
        </div>
      </main>
    )
  }

  return (
    <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
      <section className="flex flex-col gap-2 lg:gap-4 lg:flex-row justify-between lg:items-center">
        <h1 className="text-2xl font-bold space-x-4">
          Sphericals -
          {" "}
          <span className="text-primary">{sphericals.length}</span>
          <Button size="icon" variant="marathon-white" onClick={() => refetch()}>
            <RefreshCcw className="size-4" />
          </Button>
        </h1>
        <InputGroup className="lg:w-fit w-full min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by id or game" autoComplete="off" />
        </InputGroup>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="marathon-destructive" className="lg:ml-auto" disabled={!hasChecked}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete sphericals</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete the selected sphericals? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="marathon-outline" className="rounded-none">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction variant="marathon-destructive" asChild>
                <Button
                  disabled={checkedIds.length === 0}
                  onClick={deleteSphericals}
                >
                  Yes, delete {checkedIds.length} spherical{checkedIds.length > 1 ? "s" : ""}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={() => openModal()}>
          <PlusIcon className="size-4" />
          New Spherical
        </Button>
      </section>
      <ScrollArea className="h-5/6 w-full m-0">
        <Table noWrapper>
          <TableCaption>
            {isLoading && "Loading..."}
            {!isLoading && !hasNextPage && "All sphericals loaded"}
            {!isLoading && hasNextPage && (
              <Button variant="marathon-outline" disabled={isFetching} onClick={() => fetchNextPage()}>
                {isFetching ? "Loading..." : "Load more"}
              </Button>
            )}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-14"><Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} /></TableHead>
              <TableHead className="w-14">Id</TableHead>
              <TableHead>Game</TableHead>
              <TableHead className="w-25">Status</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSphericals.map((spherical) => <SphericalRow key={spherical.id} {...{ spherical, checkedIds, setCheckedIds }} />)}
          </TableBody>
        </Table>
      </ScrollArea>
      <SphericalSheet />
    </main>
  )
}

export default Page
