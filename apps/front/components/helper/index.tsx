"use client"

import { usePathname } from "next/navigation"
import { LobbyDebug } from "@/components/lobby/lobby-debug"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { selectIsAdmin } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { PAGES } from "@/constants/pages"


const HIDE_PAGES:string[] = [PAGES.CAPTURE]

export const HelperMenu = () => {
  const pathname = usePathname()
  const { openModal: openGameSuggestion } = useModal(MODAL_KEYS.SUGGEST_GAME)
  const { openModal: openReportBug } = useModal(MODAL_KEYS.REPORT_BUG)

  const isAdmin = useAppSelector(selectIsAdmin)

  // Hide on capture page for clean video recording
  if (HIDE_PAGES.includes(pathname)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="fixed bottom-4 right-4 outline-none">
        <Button variant="outline">
          Need help
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end" side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Help</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openGameSuggestion()}>
            Suggest a game
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openReportBug()}>
            Report a bug
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isAdmin && (
          <LobbyDebug />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
