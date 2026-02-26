"use client"

import {
  LogOut,
  User,
} from "lucide-react"

import Link from "next/link"
import { HelperMenuContent } from "@/components/helper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NavUserAdmin from "@/components/ui/nav-user.admin"
import { PAGES } from "@/constants/pages"
import { useLogoutMutation } from "@/redux/api/auth"
import { selectIsAdmin, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"

export const NavUser = () => {
  const user = useAppSelector(selectUser)
  const isAdmin = useAppSelector(selectIsAdmin)

  const [logout] = useLogoutMutation()

  if (!user || user.isAnonymous) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="nav-user-dropdown-trigger"
        className="flex w-fit items-center gap-2 outline-none"
      >
        <div className="grid text-left text-sm font-shapiro-wide truncate font-medium leading-tight">
          {user.pseudo}
        </div>
        <Avatar className="size-9">
          <AvatarImage src={user.avatar} alt={user.email} />
          <AvatarFallback>{firstLetter(user.pseudo)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side="bottom"
        align="end"
        sideOffset={8}
        alignOffset={-8}
      >
        {isAdmin && (
          <NavUserAdmin />
        )}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={PAGES.ACCOUNT} className="cursor-pointer">
              <User />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <HelperMenuContent />
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="logout-button" onClick={() => logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
