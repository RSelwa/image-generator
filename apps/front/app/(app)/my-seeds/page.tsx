"use client"

import { Gamepad2, Sprout } from "lucide-react"
import Link from "next/link"
import SeedCard from "@/components/cards/seed-card"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { useGetMySeedsQuery } from "@/redux/api/seed"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const Page = () => {
  const userId = useAppSelector(selectUserId)
  const { data: seeds, isLoading } = useGetMySeedsQuery(
    { userId },
    { skip: !userId },
  )

  return (
    <main className="mx-auto max-w-5xl p-4">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sprout className="size-6" />
          <h1 className="text-2xl font-bold">My Seeds</h1>
          {seeds && (
            <span className="text-sm text-muted-foreground">
              ({seeds.length})
            </span>
          )}
        </div>
        <Button asChild>
          <Link href={PAGES.SEED_MAKER}>
            <Gamepad2 className="size-4" />
            Create New Seed
          </Link>
        </Button>
      </header>

      {isLoading && <p className="text-muted-foreground">Loading seeds...</p>}

      {!isLoading && (!seeds || seeds.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12">
          <Sprout className="size-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            You haven&apos;t created any seeds yet
          </p>
          <Button asChild>
            <Link href={PAGES.SEED_MAKER}>Create your first seed</Link>
          </Button>
        </div>
      )}

      {seeds && seeds.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {seeds.map((seed) => (
            <SeedCard key={seed.id} seed={seed} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default Page
