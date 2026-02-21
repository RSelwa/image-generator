"use client"

import {
  ChevronsUpDown,
  Gamepad2,
  Globe2,
  Image,
  LayoutDashboard,
  Lightbulb,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PAGES } from "@/constants/pages"
import { useLogoutMutation } from "@/redux/api/auth"
import { selectHasRightToDashBoard, selectIsAdmin, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"
import { HelperMenuContent } from "@/components/helper"
import { LobbyDebug } from "@/components/lobby/lobby-debug"

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
        {isAdmin &&
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href={PAGES.ADMIN_USERS} className="cursor-pointer">
                    <User />
                    Users
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={PAGES.ADMIN_GAMES} className="cursor-pointer">
                    <Gamepad2 />
                    Games
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={PAGES.ADMIN_SPHERICAL} className="cursor-pointer">
                    <Globe2 />
                    Sphericals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={PAGES.ADMIN_FLATS} className="cursor-pointer">
                    <Image />
                    Flats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={PAGES.ADMIN_SUGGESTIONS} className="cursor-pointer">
                    <Lightbulb />
                    Suggestions
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
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <LobbyDebug />
            <DropdownMenuSeparator />
          </>
        }
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
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
