"use client"

import { PlusIcon, RefreshCw, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePopulateRaceSeedMutation } from "@/redux/api/cloud-functions"
import { useCreateMarathonSeedMutation, useDeleteMarathonSeedMutation, useGetMarathonSeedsInfiniteQuery } from "@/redux/api/marathon-seed"

const Page = () => {
  const { data, fetchNextPage, hasNextPage, isFetching, refetch } = useGetMarathonSeedsInfiniteQuery()
  const [createSeed, { isLoading: isCreating }] = useCreateMarathonSeedMutation()
  const [deleteSeed] = useDeleteMarathonSeedMutation()
  const [populateSeed] = usePopulateRaceSeedMutation()
  const [newName, setNewName] = useState("")
  const [populatingId, setPopulatingId] = useState<string | null>(null)
  const captionRef = useRef<HTMLTableCaptionElement>(null)

  const seeds = data?.pages.flat() || []

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await createSeed({ name })
    setNewName("")
  }

  const handlePopulate = async (seedId: string) => {
    setPopulatingId(seedId)
    await populateSeed({ seedId, playerCurrentIndex: 0 })
    setPopulatingId(null)
    refetch()
  }

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting && hasNextPage && !isFetching) fetchNextPage()
  }, [hasNextPage, isFetching, fetchNextPage])

  useEffect(() => {
    const caption = captionRef.current
    if (!caption) return
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 })
    observer.observe(caption)

    return () => observer.disconnect()
  }, [handleIntersect])

  return (
    <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
      <section className="flex flex-col gap-2 lg:gap-8 lg:flex-row justify-between lg:items-center">
        <h1 className="text-2xl font-bold">
          Marathon Seeds — <span className="text-primary">{seeds.length}</span>
        </h1>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Seed name"
            className="w-56"
          />
          <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
            <PlusIcon className="size-4" />
            Create
          </Button>
        </div>
      </section>

      <ScrollArea className="h-5/6">
        <Table noWrapper>
          <TableCaption ref={captionRef}>
            {isFetching && "Loading..."}
            {!isFetching && !hasNextPage && "All seeds loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rounds</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seeds.map((seed) => (
              <TableRow key={seed.id}>
                <TableCell className="font-medium">{seed.name}</TableCell>
                <TableCell className="font-mono">{seed.rounds.length}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {seed.createdAt ? new Date(seed.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Populate seed"
                      disabled={populatingId === seed.id}
                      onClick={() => handlePopulate(seed.id)}
                    >
                      <RefreshCw className={`size-4 ${populatingId === seed.id ? "animate-spin" : ""}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete seed?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{seed.name}&quot; and its {seed.rounds.length} rounds.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSeed({ seedId: seed.id })}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </main>
  )
}

export default Page
