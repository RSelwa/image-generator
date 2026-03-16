"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MODAL_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useModal } from "@/hooks/use-modal"
import { usePathname } from "@/i18n/routing"

const HIDE_PAGES: string[] = [PAGES.CAPTURE]

export const HelperMenuContent = () => {
  const { openModal: openGameSuggestion } = useModal(MODAL_KEYS.SUGGEST_GAME)
  const { openModal: openReportBug } = useModal(MODAL_KEYS.REPORT_BUG)
  const { openModal: openMakeSuggestion } = useModal(MODAL_KEYS.MAKE_SUGGESTION)

  const tBug = useTranslations("reportBug")
  const tSugs = useTranslations("makeSuggestion")
  const tGame = useTranslations("suggestGame")

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Help</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => openGameSuggestion()}>
        {tGame("title")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openReportBug()}>
        {tBug("title")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openMakeSuggestion()}>
        {tSugs("title")}
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}

export const HelperMenu = () => {
  const pathname = usePathname()

  // Hide on capture page for clean video recording
  if (HIDE_PAGES.includes(pathname)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="fixed bottom-4 right-4 outline-none">
        <Button variant="marathon-outline">
          Need help
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end" side="top">
        <HelperMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
