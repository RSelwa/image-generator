"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"

export const HelperMenu = () => {
  const { openModal: openGameSuggestion } = useModal(MODAL_KEYS.SUGGEST_GAME)
  const { openModal: openReportBug } = useModal(MODAL_KEYS.REPORT_BUG)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="fixed bottom-4 right-4 outline-none">
        <Button variant="outline">
          Need help
        </Button>

      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end" side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openGameSuggestion()}>
            Suggest a game
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openReportBug()}>
            Report a bug
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>

    </DropdownMenu>
  )
}
