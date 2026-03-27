"use client"

import { UMA_STUDIO_URL } from "@repo/common"

import {
  Brush,
  Calendar,
  Coffee,
  Crown,
  History,
  LogOut,
  Timer,
  User,
  Wrench,
  Zap,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { HelperMenuContent } from "@/components/helper"
import { UserAvatar } from "@/components/ui/user-avatar"
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
import { BUY_ME_A_COFFEE_LINK, BUY_ME_A_COFFEE_LINK_MEMBERSHIPS, PORTFOLIO_LINK } from "@/constants/social"
import { Link, useRouter } from "@/i18n/routing"
import { useLogoutMutation } from "@/redux/api/auth"
import { useCreateAndJoinLobbyMutation } from "@/redux/api/lobby"
import { selectIsAdmin, selectUser, selectUserSteak } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"
import { isTextGlow } from "@/utils/user"

export const NavUser = () => {
  const router = useRouter()

  const t = useTranslations("nav")

  const userStreak = useAppSelector(selectUserSteak)
  const user = useAppSelector(selectUser)
  const isAdmin = useAppSelector(selectIsAdmin)

  const [createLobbyDoc, { isLoading }] = useCreateAndJoinLobbyMutation()
  const isCreatingRef = useRef(false)

  const [logout] = useLogoutMutation()

  if (!user || user.isAnonymous) return null

  const handleCreateLobby = async () => {
    if (isCreatingRef.current) return
    isCreatingRef.current = true
    try {
      const lobby = await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
      isCreatingRef.current = false
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="nav-user-dropdown-trigger"
        className="flex w-fit items-center gap-6 outline-none"
      >
        <div className={cn("grid text-left text-sm font-shapiro-wide truncate font-medium leading-tight", isTextGlow(user.donorTier) && "glow-text")}>
          {user.pseudo}
        </div>
        <UserAvatar avatar={user.avatar} name={user.pseudo} donorTier={user.donorTier} className="size-9" />
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
            {t("play")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={PAGES.DAILY_CHALLENGE}>
              <Calendar />
              {t("dailyChallenge")}
              {Boolean(userStreak) && ` - ${userStreak} 🔥`}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={PAGES.RACE}>
              <Timer />
              {t("race")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGES.ACCOUNT} className="cursor-pointer">
              <User />
              {t("account")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGES.HISTORY} className="cursor-pointer" data-testid="nav-history-link">
              <History />
              {t("history")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup />
        <DropdownMenuSeparator />
        <HelperMenuContent />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("about")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={BUY_ME_A_COFFEE_LINK} target="_blank" className="cursor-pointer bg-marathon-yellow text-marathon-yellow-foreground">
              <Coffee />
              Buy me a coffee
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={BUY_ME_A_COFFEE_LINK_MEMBERSHIPS} target="_blank" className="cursor-pointer bg-blue-accent-foreground">
              <Crown />
              Become a member
            </Link>
          </DropdownMenuItem>
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
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
