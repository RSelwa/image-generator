"use client"

import { UMA_STUDIO_URL } from "@repo/common"

import {
  Brush,
  LogOut,
  User,
  Wrench,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { PORTFOLIO_LINK } from "@/constants/social"
import { useLogoutMutation } from "@/redux/api/auth"
import { useCreateAndJoinLobbyMutation } from "@/redux/api/lobby"
import { selectIsAdmin, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"

export const NavUser = () => {
  const router = useRouter()

  const user = useAppSelector(selectUser)
  const isAdmin = useAppSelector(selectIsAdmin)

  const [createLobbyDoc, { isLoading }] = useCreateAndJoinLobbyMutation()

  const [logout] = useLogoutMutation()

  if (!user || user.isAnonymous) return null

  const handleCreateLobby = async () => {
    try {
      const lobby = await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
    }
  }

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
          <DropdownMenuLabel>Play</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCreateLobby} disabled={isLoading} className="cursor-pointer">
            <Zap />
            Play
          </DropdownMenuItem>
        </DropdownMenuGroup>
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
        <DropdownMenuGroup>
          <DropdownMenuLabel>About</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={PORTFOLIO_LINK} target="_blank" className="cursor-pointer">
              <Wrench />
              Made by me
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={UMA_STUDIO_URL} target="_blank" className="cursor-pointer">
              <Brush />
              Interfaces by UMA Studio
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="logout-button" onClick={() => logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
