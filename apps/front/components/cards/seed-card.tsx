"use client"

import { type SeedDocWithId } from "@repo/schemas"
import { Clock, Copy, Play } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DIFFICULTIES_TO_BADGE_VARIANT, FALL_BACK_IMAGE, MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"

const SeedCard = ({ seed }: { seed: SeedDocWithId }) => {
  const { openModal } = useModal(MODAL_KEYS.SEED_DETAIL, seed.id)

  const specialCount = seed.rounds.filter((r) => r.isSpecial).length
  const normalCount = seed.rounds.length - specialCount

  const difficulties = seed.rounds.reduce(
    (acc, r) => {
      acc[r.difficulty] = (acc[r.difficulty] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get unique game thumbnails from first few rounds
  const thumbnails = seed.rounds
    .map((r) => r.gameThumbnailUrl)
    .filter((url): url is string => !!url)
    .filter((url, i, arr) => arr.indexOf(url) === i)
    .slice(0, 3)

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(seed.id)
    toast.success("Seed ID copied!")
  }

  const createdAt = seed.createdAt
    ? new Date(
        "seconds" in seed.createdAt
          ? seed.createdAt.seconds * 1000
          : seed.createdAt,
      ).toLocaleDateString()
    : null

  return (
    <div
      onClick={() => openModal()}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-lg font-semibold">
          {seed.name || "Unnamed seed"}
        </h3>
        <button
          type="button"
          onClick={handleCopyId}
          className="shrink-0 rounded p-1 hover:bg-neutral-100"
          title="Copy seed ID"
        >
          <Copy className="size-4 text-muted-foreground" />
        </button>
      </div>

      {thumbnails.length > 0 && (
        <div className="mt-3 flex gap-2">
          {thumbnails.map((url) => (
            <div key={url} className="relative size-16 overflow-hidden rounded-md">
              <Image
                src={url || FALL_BACK_IMAGE}
                alt="Game thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{seed.rounds.length} rounds</Badge>
        {normalCount > 0 && (
          <Badge variant="outline">{normalCount} normal</Badge>
        )}
        {specialCount > 0 && (
          <Badge variant="orange">{specialCount} special</Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(difficulties).map(([difficulty, count]) => (
          <Badge
            key={difficulty}
            variant={DIFFICULTIES_TO_BADGE_VARIANT[difficulty as keyof typeof DIFFICULTIES_TO_BADGE_VARIANT]}
          >
            {count} {difficulty}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Play className="size-3" />
          Used {seed.timesUsed} times
        </span>
        {createdAt && (
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {createdAt}
          </span>
        )}
      </div>
    </div>
  )
}

export default SeedCard
