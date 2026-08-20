"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import Loader from "@/components/icons/loader"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { useRouter } from "@/i18n/routing"
import { useGetLobbyByCodeQuery } from "@/redux/api/lobby"

const KEY = MODAL_KEYS.JOIN_LOBBY
const MIN_CODE_LENGTH = 4
const MAX_CODE_LENGTH = 6

export const JoinLobbyModal = () => {
  const t = useTranslations("joinLobbyModal")
  const router = useRouter()

  const [code, setCode] = useState("")

  const { data: lobby, isFetching } = useGetLobbyByCodeQuery(
    { code },
    { skip: code.length < MIN_CODE_LENGTH },
  )

  const isSearching = code.length >= MIN_CODE_LENGTH && isFetching
  const notFound = code.length === MAX_CODE_LENGTH && !isFetching && !lobby

  const handleJoin = () => {
    if (!lobby) return

    router.push(`${PAGES.JOIN_LOBBY}/${lobby.code}`)
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-md" title={t("title")}>
      <div className="flex flex-col gap-4">
        <Input
          data-testid={SELECTORS.JOIN_LOBBY_CODE_INPUT}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("placeholder")}
          maxLength={MAX_CODE_LENGTH}
          className="font-mono uppercase"
        />
        {isSearching && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader className="size-4" />
            {t("searching")}
          </p>
        )}
        {!isSearching && lobby && (
          <p data-testid={SELECTORS.JOIN_LOBBY_FOUND} className="text-muted-foreground text-sm">
            {t("found", { count: lobby.players.length })}
          </p>
        )}
        {notFound && (
          <p data-testid={SELECTORS.JOIN_LOBBY_NOT_FOUND} className="text-destructive text-sm">{t("notFound")}</p>
        )}
        <Button
          data-testid={SELECTORS.JOIN_LOBBY_SUBMIT}
          className="w-full"
          disabled={!lobby || isFetching}
          onClick={handleJoin}
        >
          {t("join")}
        </Button>
      </div>
    </ModalBase>
  )
}
