"use client"

import { getDateFromString } from "@repo/common"
import { Search } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetUsersCountQuery, useGetUsersInfiniteQuery } from "@/redux/api/user"

const Page = () => {
  const { data: usersCount } = useGetUsersCountQuery()
  const { data: users, fetchNextPage, hasNextPage, isFetching } = useGetUsersInfiniteQuery()
  const captionRef = useRef<HTMLTableCaptionElement>(null)

  const [input, setInput] = useState("")
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const flatUsers = (users?.pages.flat() || []).filter((user) => user.id.includes(input) || user.email?.toLowerCase()?.includes(input.toLowerCase()))

  const isAllChecked = flatUsers.length > 0 && flatUsers.every((user) => checkedIds.includes(user.id))

  const toggleAllChecked = (value: boolean) => {
    setCheckedIds(value ? flatUsers.map((user) => user.id) : [])
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
      <section className="flex items-center gap-8">
        <h1 className="text-2xl font-bold">
          Users - <span className="text-primary">{usersCount}</span>
        </h1>
        <InputGroup className="w-fit min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by id or email" autoComplete="off" />
        </InputGroup>
      </section>
      <ScrollArea className="h-5/6">
        <Table noWrapper>
          <TableCaption ref={captionRef}>
            {isFetching && "Loading..."}
            {!isFetching && !hasNextPage && "All users loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-14"><Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} /></TableHead>
              <TableHead className="w-14">Id</TableHead>
              <TableHead className="w-25">Email</TableHead>
              <TableHead>Pseudo</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatUsers.map((user) => {
              const checked = checkedIds.includes(user.id)
              const onCheckedChange = (value: boolean) =>
                setCheckedIds((prev) => value ? [...prev, user.id] : prev.filter((id) => id !== user.id))

              return (
                <TableRow key={user.id}>
                  <TableCell><Checkbox checked={checked} onCheckedChange={onCheckedChange} /></TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.pseudo}</TableCell>
                  <TableCell>{getDateFromString(user.createdAt?.toDate())}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </main>
  )
}

export default Page
