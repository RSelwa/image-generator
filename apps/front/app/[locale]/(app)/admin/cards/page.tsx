"use client"

import { PlusIcon, RefreshCcw, Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { CardSheet } from "@/components/sheet/card-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BADGE_VARIANTS,
  CARD_RARITY_TO_BADGE_VARIANT,
  MODAL_KEYS,
  QUERY_PARAMS,
} from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useModal } from "@/hooks/use-modal"
import { useGetCardsQuery } from "@/redux/api/cards"
import { useGetAllGamesQuery } from "@/redux/api/games"
import { useGetMapsQuery } from "@/redux/api/maps"
import { type AdminCardRow, buildAdminCardRows } from "@/utils/admin-card-rows"
import { formatCardNumber } from "@/utils/card-number"

const Page = () => {
  const { openModal } = useModal(MODAL_KEYS.NEW_CARD, "new")
  const { data: cards, isLoading: isLoadingCards, refetch } = useGetCardsQuery()
  const { data: games, isLoading: isLoadingGames } = useGetAllGamesQuery()
  const { data: maps, isLoading: isLoadingMaps } = useGetMapsQuery()

  const [, setCardId] = useQueryState(QUERY_PARAMS.CARD_ID)
  const [input, setInput] = useState("")

  const isLoading = isLoadingCards || isLoadingGames || isLoadingMaps
  const rows = buildAdminCardRows(cards || [], games || [], maps || [])
  const search = input.toLowerCase()
  const isMatchingSearch = ({ card, name, gameTitle }: AdminCardRow) =>
    formatCardNumber(card.cardProperties.number).includes(search) ||
    (name || "").toLowerCase().includes(search) ||
    (gameTitle || "").toLowerCase().includes(search)
  const filtered = rows.filter(isMatchingSearch)

  return (
    <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
      <section className="flex flex-col gap-2 lg:gap-8 lg:flex-row justify-between lg:items-center">
        <h1 className="text-2xl font-bold space-x-4">
          Cards - <span className="text-primary">{cards?.length || 0}</span>
          <Button size="icon" variant="marathon-white" onClick={refetch}>
            <RefreshCcw className="size-4" />
          </Button>
        </h1>
        <InputGroup className="lg:w-fit w-full min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by number, name or game"
            autoComplete="off"
          />
        </InputGroup>
        <Button
          onClick={() => openModal()}
          className="lg:ml-auto"
          data-testid={SELECTORS.ADMIN_CARD_NEW}
        >
          <PlusIcon className="size-4" />
          New Card
        </Button>
      </section>

      <ScrollArea className="h-5/6">
        <Table noWrapper>
          <TableCaption>
            {isLoading && "Loading..."}
            {!isLoading && "All cards loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rarity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ card, name, gameTitle, isDuplicateNumber }) => (
              <TableRow
                key={card.id}
                onClick={() => setCardId(card.id)}
                className="cursor-pointer"
                data-testid={SELECTORS.ADMIN_CARD_ROW(card.id)}
              >
                <TableCell className="font-mono space-x-2">
                  <span>{formatCardNumber(card.cardProperties.number)}</span>
                  {isDuplicateNumber && (
                    <Badge variant={BADGE_VARIANTS.RED}>duplicate</Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {name}
                  {!name && (
                    <span className="text-destructive">
                      Missing {card.type}
                    </span>
                  )}
                </TableCell>
                <TableCell>{gameTitle || card.gameId}</TableCell>
                <TableCell>{card.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      CARD_RARITY_TO_BADGE_VARIANT[card.cardProperties.rarity]
                    }
                  >
                    {card.cardProperties.rarity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <CardSheet rows={rows} />
    </main>
  )
}

export default Page
