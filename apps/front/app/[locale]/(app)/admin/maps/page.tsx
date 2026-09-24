"use client"

import { CARD_RARITY } from "@repo/common"
import { useState } from "react"
import AdminHeader from "@/components/admin-header"
import { MapCard } from "@/components/cards/map-card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CARD_RARITY_FILTER } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useGetMapsQuery } from "@/redux/api/maps"
import {
  type CardRarityFilter,
  cardRarityFilterSchema,
} from "@/schemas/card-rarity-filter"
import {
  countMapsByCardRarity,
  filterMapsByCardRarity,
} from "@/utils/card-rarity"

const RARITY_FILTER_OPTIONS = [
  { value: CARD_RARITY_FILTER.ALL, label: "All maps" },
  { value: CARD_RARITY_FILTER.NOT_RATED, label: "Not rated" },
  ...Object.values(CARD_RARITY).map((rarity) => ({
    value: rarity,
    label: rarity,
  })),
]

const Page = () => {
  const { data, isLoading } = useGetMapsQuery()
  const [rarityFilter, setRarityFilter] = useState<CardRarityFilter>(
    CARD_RARITY_FILTER.ALL,
  )

  const allMaps = data || []
  const maps = filterMapsByCardRarity(allMaps, rarityFilter)

  return (
    <main className="p-2 h-full-height-admin">
      <AdminHeader title="Maps" />

      <ul className="mb-4 flex flex-wrap gap-2">
        {countMapsByCardRarity(allMaps, RARITY_FILTER_OPTIONS).map(
          ({ value, label, count }) => (
            <li key={value}>
              <Badge variant="outline">
                {label}: {count}
              </Badge>
            </li>
          ),
        )}
      </ul>

      <div className="mb-4 w-56">
        <Select
          value={rarityFilter}
          onValueChange={(value) =>
            setRarityFilter(cardRarityFilterSchema.parse(value))
          }
        >
          <SelectTrigger data-testid={SELECTORS.ADMIN_MAPS_RARITY_FILTER}>
            <SelectValue placeholder="Filter by rarity" />
          </SelectTrigger>
          <SelectContent>
            {RARITY_FILTER_OPTIONS.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                data-testid={SELECTORS.ADMIN_MAPS_RARITY_FILTER_OPTION(value)}
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p>Loading...</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} gameId={map.gameId} />
        ))}
      </ul>
    </main>
  )
}

export default Page
