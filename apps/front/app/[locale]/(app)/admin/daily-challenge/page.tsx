"use client"

import { type DailyChallengeDocWithId, toDailyChallengeEntity } from "@repo/schemas"
import { PlusIcon, Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { useCallback, useEffect, useRef, useState } from "react"
import { DailyChallengeSheet } from "@/components/sheet/daily-challenge-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BADGE_VARIANTS, DIFFICULTIES_TO_BADGE_VARIANT, MODAL_KEYS, QUERY_PARAMS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetDailyChallengesInfiniteQuery } from "@/redux/api/daily-challenge"

const DailyChallengeRow = ({
  challenge,
  checkedDates,
  setCheckedDates,
}: {
  challenge: DailyChallengeDocWithId
  checkedDates: string[]
  setCheckedDates: React.Dispatch<React.SetStateAction<string[]>>
}) => {
  const [, setDate] = useQueryState(QUERY_PARAMS.DAILY_CHALLENGE_DATE)

  const checked = checkedDates.includes(challenge.date)
  const onCheckedChange = (value: boolean) =>
    setCheckedDates((prev) => value ? [...prev, challenge.date] : prev.filter((d) => d !== challenge.date))

  const parsed = toDailyChallengeEntity(challenge)

  return (
    <TableRow onClick={() => setDate(challenge.date)} className="cursor-pointer">
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      </TableCell>
      <TableCell className="font-mono">{challenge.date}</TableCell>
      <TableCell className="font-medium">{challenge.gameTitle}</TableCell>
      <TableCell>{challenge.gameId}</TableCell>
      <TableCell>
        <Badge variant={DIFFICULTIES_TO_BADGE_VARIANT[challenge.difficulty]}>
          {challenge.difficulty}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={challenge.isSpherical ? "blue" : "purple"}>
          {challenge.isSpherical ? "Spherical" : "Flat"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={parsed ? BADGE_VARIANTS.GREEN : BADGE_VARIANTS.RED}>
          {parsed ? "Ready" : "Not ready"}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

const Page = () => {
  const { openModal } = useModal(MODAL_KEYS.NEW_DAILY_CHALLENGE, "new")
  const { data: challenges, fetchNextPage, hasNextPage, isFetching } = useGetDailyChallengesInfiniteQuery()
  const captionRef = useRef<HTMLTableCaptionElement>(null)

  const [input, setInput] = useState("")
  const [checkedDates, setCheckedDates] = useState<string[]>([])

  const flat: DailyChallengeDocWithId[] = challenges?.pages.flat() || []
  const filtered = flat.filter(
    (c) => c.date.includes(input) || c.gameTitle?.toLowerCase().includes(input.toLowerCase()),
  )

  const isAllChecked = filtered.length > 0 && filtered.every((c) => checkedDates.includes(c.date))
  const toggleAllChecked = (value: boolean) =>
    setCheckedDates(value ? filtered.map((c) => c.date) : [])

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
          Daily Challenges - <span className="text-primary">{flat.length}</span>
        </h1>
        <InputGroup className="lg:w-fit w-full min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by date or game title"
            autoComplete="off"
          />
        </InputGroup>
        <Button onClick={() => openModal()} className="lg:ml-auto">
          <PlusIcon className="size-4" />
          New Daily Challenge
        </Button>
      </section>

      <ScrollArea className="h-5/6">
        <Table noWrapper>
          <TableCaption ref={captionRef}>
            {isFetching && "Loading..."}
            {!isFetching && !hasNextPage && "All daily challenges loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-14">
                <Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Game Title</TableHead>
              <TableHead>Game ID</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ready</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((challenge) => (
              <DailyChallengeRow
                key={challenge.date}
                challenge={challenge}
                checkedDates={checkedDates}
                setCheckedDates={setCheckedDates}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <DailyChallengeSheet />
    </main>
  )
}

export default Page
