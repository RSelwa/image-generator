"use client"

import { getDateFromString } from "@repo/common"
import { Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { useCallback, useState } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import SheetAdminUser from "@/components/sheet/user-admin"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getUserRef } from "@/constants/db-refs"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useGetUsersCountQuery, useGetUsersInfiniteQuery } from "@/redux/api/user"
import { getBadgeVariantByDate } from "@/utils/badge"
import { getAvatarUrl } from "@/utils/file"

const Page = () => {
  const [_, setUserId] = useQueryState(QUERY_PARAMS.USER_ID)

  const { data: usersCount } = useGetUsersCountQuery()
  const { data: users, fetchNextPage, hasNextPage, isFetching } = useGetUsersInfiniteQuery()
  const [input, setInput] = useState("")
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const flatUsers = (users?.pages.flat() || []).filter((user) => user.id.includes(input) || user.email?.toLowerCase()?.includes(input.toLowerCase()))

  const isAllChecked = flatUsers.length > 0 && flatUsers.every((user) => checkedIds.includes(user.id))

  const toggleAllChecked = (value: boolean) => {
    setCheckedIds(value ? flatUsers.map((user) => user.id) : [])
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    if (isBottom && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetching, fetchNextPage])

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
      <ScrollArea onScroll={handleScroll} className="h-5/6">
        <Table noWrapper>
          <TableCaption>
            {isFetching && "Loading..."}
            {!isFetching && !hasNextPage && "All users loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-14"><Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} /></TableHead>
              <TableHead className="w-20">Id</TableHead>
              <TableHead className="w-25">Email</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatUsers.map((user) => {
              const checked = checkedIds.includes(user.id)
              const onCheckedChange = (value: boolean) =>
                setCheckedIds((prev) => value ? [...prev, user.id] : prev.filter((id) => id !== user.id))

              return (
                <TableRow key={user.id} onClick={() => setUserId(user.id)}>
                  <TableCell><Checkbox checked={checked} onCheckedChange={onCheckedChange} /></TableCell>
                  <TableCell className="max-w-20 truncate"><OpenFirestoreDoc docRef={getUserRef(user.id)} />{user.id} </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    {user.avatar && (
                      <Avatar className="size-9">
                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.email} />
                      </Avatar>
                    )}
                    <div className="flex flex-col justify-start">
                      <span>
                        {user.pseudo}
                      </span>
                      <span className="text-neutral-400 text-xs">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariantByDate(user.createdAt?.toDate())}>
                      {getDateFromString(user.createdAt?.toDate())}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <SheetAdminUser />
    </main>
  )
}

export default Page
