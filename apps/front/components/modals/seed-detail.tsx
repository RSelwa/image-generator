"use client"

import { ROUND_TYPE } from "@repo/common"
import { type Round } from "@repo/schemas"
import { Clock, Copy, Play, Star, StarOff } from "lucide-react"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DIFFICULTIES_TO_BADGE_VARIANT, FALL_BACK_IMAGE, MODAL_KEYS } from "@/constants/mapping"
import { useChangeSeedNameMutation, useGetSeedByIdQuery, useToggleFeaturedSeedMutation } from "@/redux/api/seed"

const DEBOUNCE_DELAY = 700

const RoundRow = ({ round, index }: { round: Round, index: number }) => {
  const imageUrl = round.isSpecial ? round.options?.[0]?.thumbnailUrl : round.type === ROUND_TYPE.FLAT ? round.flatImageUrl : round.sphericalImageUrl

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
        {index + 1}
      </div>
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
        <Image
          src={imageUrl || FALL_BACK_IMAGE}
          alt={`Round ${index + 1}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {round.isSpecial && (
            <Badge variant="orange">Special</Badge>
          )}
          {!round.isSpecial && (
            <Badge variant="outline" className="capitalize">
              {round.type}
            </Badge>
          )}
          <Badge
            variant={DIFFICULTIES_TO_BADGE_VARIANT[round.difficulty as keyof typeof DIFFICULTIES_TO_BADGE_VARIANT]}
          >
            {round.difficulty}
          </Badge>
        </div>
        {round.gameTitle && (
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {round.gameTitle}
          </p>
        )}
      </div>
      {round.isSpecial && round.options && (
        <div className="flex gap-1">
          {round.options.map((option) => (
            <div key={option.thumbnailUrl} className="relative size-10 overflow-hidden rounded">
              <Image
                src={option.thumbnailUrl || FALL_BACK_IMAGE}
                alt={option.gameTitle}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const SeedDetailModal = () => {
  const [seedId] = useQueryState(MODAL_KEYS.SEED_DETAIL)
  const [toggleFeatured, { isLoading: isLoadingFeatured }] = useToggleFeaturedSeedMutation()
  const [changeName, { isLoading: isLoadingName }] = useChangeSeedNameMutation()

  const [localName, setLocalName] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedChangeName = useCallback((name: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (seedId) changeName({ id: seedId, name })
    }, DEBOUNCE_DELAY)
  }, [seedId, changeName])

  const isLoadingUpdate = isLoadingFeatured || isLoadingName

  const { data: seed, isLoading } = useGetSeedByIdQuery(
    { id: seedId || "" },
    { skip: !seedId },
  )

  useEffect(() => {
    setLocalName(seed?.name || "Unnamed seed")
  }, [seed?.name])

  if (!seedId || isLoading) {
    return <LoadingModal modalKey={MODAL_KEYS.SEED_DETAIL} />
  }

  if (!seed) {
    return (
      <ModalBase modalKey={MODAL_KEYS.SEED_DETAIL}>
        <p className="p-4 text-center text-muted-foreground">Seed not found</p>
      </ModalBase>
    )
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(seed.id)
    toast.success("Seed ID copied!")
  }

  const createdAt = seed.createdAt ? new Date(
    "seconds" in seed.createdAt ? seed.createdAt.seconds * 1000 : seed.createdAt,
  ).toLocaleDateString() : null

  const specialCount = seed.rounds.filter((r) => r.isSpecial).length

  return (
    <ModalBase modalKey={MODAL_KEYS.SEED_DETAIL} className="max-w-2xl">
      <div className="space-y-4 pt-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold  flex items-center gap-4">
              <Input
                value={localName}
                onChange={(e) => {
                  setLocalName(e.target.value)
                  debouncedChangeName(e.target.value)
                }}
              />
              <button disabled={isLoadingUpdate} onClick={() => toggleFeatured({ id: seed.id })} className="disabled:bg-neutral-300">
                {seed.featuredAt ? <Star className="size-4 fill-primary text-primary" /> : <StarOff className="size-4 text-primary" />}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Play className="size-3" />
                Used
                {" "}
                {seed.timesUsed}
                {" "}
                times
              </span>
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {createdAt}
                </span>
              )}
            </div>
          </div>

          <Button variant="marathon-outline" size="sm" onClick={handleCopyId}>
            <Copy className="size-4" />
            Copy ID
          </Button>
        </header>

        <div className="flex gap-2">
          <Badge variant="secondary">{seed.rounds.length} rounds</Badge>
          {specialCount > 0 && (
            <Badge variant="orange">{specialCount} special</Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {seed.rounds.map((round, index) => (
            <RoundRow key={round.gameId || index} round={round} index={index} />
          ))}
        </div>
      </div>
    </ModalBase>
  )
}
