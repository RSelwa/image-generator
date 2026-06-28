"use client"

import { useState } from "react"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useModal } from "@/hooks/use-modal"
import { useRouter } from "@/i18n/routing"
import { useGetLobbyByCodeQuery } from "@/redux/api/lobby"

const KEY = MODAL_KEYS.JOIN_LOBBY
const MIN_CODE_LENGTH = 4
const MAX_CODE_LENGTH = 6

export const JoinLobbyModal = () => {
  const router = useRouter()
  const { closeModal } = useModal(KEY)

  const [code, setCode] = useState("")
  const [search, setSearch] = useState("")

  const { data: lobby } = useGetLobbyByCodeQuery(
    { code: search },
    { skip: search.length < MIN_CODE_LENGTH },
  )

  const handleJoin = () => {
    if (!lobby) return
    closeModal()
    router.push(`${PAGES.JOIN_LOBBY}/${lobby.code}`)
  }

  const notFound = search.length >= MIN_CODE_LENGTH && !lobby

  return (
    <ModalBase modalKey={KEY} className="max-w-md" title="Join a lobby">
      <div className="flex flex-col gap-4">
        <Input
          value={code}
          onChange={(e) => {
            const v = e.target.value.toUpperCase()
            setCode(v)
            if (v.length >= MIN_CODE_LENGTH) setSearch(v)
          }}
          placeholder="Enter code (e.g. AB1C2D)"
          maxLength={MAX_CODE_LENGTH}
          className="font-mono uppercase"
        />
        {lobby && (
          <p className="text-sm text-muted-foreground">
            Found a lobby with {lobby.players.length} player{lobby.players.length !== 1 && "s"}.
          </p>
        )}
        {notFound && (
          <p className="text-sm text-destructive">No lobby found with this code.</p>
        )}
        <Button
          className="w-full"
          disabled={!lobby}
          onClick={handleJoin}
        >
          Join
        </Button>
      </div>
    </ModalBase>
  )
}
