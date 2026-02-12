"use client"

import {
  ChevronsUpDown,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Sprout,
  User,
} from "lucide-react"

import Link from "next/link"
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
import { PAGES } from "@/constants/pages"
import { useLogoutMutation } from "@/redux/api/auth"
import { selectHasRightToDashBoard, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"

export const NavUser = () => {
  const user = useAppSelector(selectUser)
  const hasRights = useAppSelector(selectHasRightToDashBoard)

  const [logout] = useLogoutMutation()

  if (!user || user.isAnonymous) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="nav-user-dropdown-trigger"
        className="flex w-56 items-center gap-2 outline-none"
      >
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={user.photoUrl} alt={user.email} />
          <AvatarFallback className="rounded-lg">{firstLetter(user.pseudo)}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.pseudo}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.photoUrl} alt={user.email} />
              <AvatarFallback className="rounded-lg">{firstLetter(user.pseudo)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.pseudo}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {hasRights && (
            <DropdownMenuItem asChild>
              <Link href={PAGES.ADMIN} className="cursor-pointer">
                <LayoutDashboard />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={PAGES.ACCOUNT} className="cursor-pointer">
              <User />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGES.SEED_MAKER} className="cursor-pointer">
              <Gamepad2 />
              Make a round
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGES.MY_SEEDS} className="cursor-pointer">
              <Sprout />
              My Seeds
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
