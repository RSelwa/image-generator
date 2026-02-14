"use client"

import * as React from "react"
import { Pagination } from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetUsersCountQuery, useGetUsersInfiniteQuery } from "@/redux/api/user"

const Page = () => {
  const { data: usersCount } = useGetUsersCountQuery()
  const { data: users } = useGetUsersInfiniteQuery()

  const flatUsers = users?.pages.flat() || []

  return (
    <main className="h-full-height-admin max-h-full-height-admin">
      <div>
        {usersCount}
      </div>
      <ScrollArea className="h-full-height-admin">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Pagination>
        {}
      </Pagination>

    </main>
  )
}

export default Page
