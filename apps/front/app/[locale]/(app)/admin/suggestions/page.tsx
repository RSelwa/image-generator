"use client"

import { getDateFromString } from "@repo/common"
import { type SuggestionDocWithId } from "@repo/schemas"
import { Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { SuggestionSheet } from "@/components/sheet/suggestion-sheet"
import SheetAdminUser from "@/components/sheet/user-admin"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSuggestionRef } from "@/constants/db-refs"
import { QUERY_PARAMS, SUGGESTIONS_TYPE_TO_BADGE_VARIANT } from "@/constants/mapping"
import { useGetAllSuggestionsInfiniteQuery, useGetSuggestionsCountQuery } from "@/redux/api/suggestions"

const SuggestionRow = ({ suggestion, checkedIds, setCheckedIds }: {
  suggestion: SuggestionDocWithId
  checkedIds: string[]
  setCheckedIds: Dispatch<SetStateAction<string[]>>
}) => {
  const [_, setSuggestionId] = useQueryState(QUERY_PARAMS.SUGGESTION_ID)

  const checked = checkedIds.includes(suggestion.id)
  const onCheckedChange = (value: boolean) =>
    setCheckedIds((prev) => value ? [...prev, suggestion.id] : prev.filter((id) => id !== suggestion.id))

  return (
    <TableRow key={suggestion.id} onClick={() => setSuggestionId(suggestion.id)} data-viewed={Boolean(suggestion.viewedAt)} className="data-[viewed=false]:bg-muted/50 cursor-pointer">
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </TableCell>
      <TableCell>
        {suggestion.id}
        <OpenFirestoreDoc docRef={getSuggestionRef(suggestion.id)} />

      </TableCell>
      <TableCell className="font-medium">{suggestion.title}</TableCell>
      <TableCell>
        {
          suggestion.type && (
            <Badge variant={SUGGESTIONS_TYPE_TO_BADGE_VARIANT[suggestion.type]}>
              {suggestion.type}
            </Badge>
          )
        }
      </TableCell>
      <TableCell className="cursor-pointer underline text-neutral-400 hover:text-white transition-colors">{suggestion.createdBy}</TableCell>
      <TableCell>{getDateFromString(suggestion.createdAt?.toDate())}</TableCell>
    </TableRow>
  )
}

const Page = () => {
  const { data: suggestionsCount } = useGetSuggestionsCountQuery()
  const { data: suggestions, fetchNextPage, hasNextPage, isFetching } = useGetAllSuggestionsInfiniteQuery()
  const captionRef = useRef<HTMLTableCaptionElement>(null)

  const [input, setInput] = useState("")
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const flatSuggestions = (suggestions?.pages.flat() || []).filter((user) => user.id.includes(input))

  const isAllChecked = flatSuggestions.length > 0 && flatSuggestions.every((user) => checkedIds.includes(user.id))

  const toggleAllChecked = (value: boolean) => {
    setCheckedIds(value ? flatSuggestions.map((user) => user.id) : [])
  }

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting && hasNextPage && !isFetching) {
      fetchNextPage()
    }
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
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
        <h1 className="text-2xl font-bold">
          Suggestions - <span className="text-primary">{suggestionsCount}</span>
        </h1>
        <InputGroup className="sm:w-fit w-full min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by id" autoComplete="off" />
        </InputGroup>
      </section>
      <ScrollArea className="h-5/6" horizontal>
        <Table noWrapper>
          <TableCaption ref={captionRef}>
            {isFetching && "Loading..."}
            {!isFetching && !hasNextPage && "All suggestions loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-14"><Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} /></TableHead>
              <TableHead className="w-20">Id</TableHead>
              <TableHead className="w-25">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatSuggestions.map((suggestion) => <SuggestionRow key={suggestion.id} {...{ setCheckedIds, checkedIds, suggestion }} />)}
          </TableBody>
        </Table>
      </ScrollArea>
      <SuggestionSheet />
      <SheetAdminUser />
    </main>
  )
}

export default Page
