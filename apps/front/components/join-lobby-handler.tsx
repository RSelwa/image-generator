"use client"

import { LOBBY_STATUS } from "@repo/common"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { PAGES } from "@/constants/pages"
import { useGetLobbyByCodeQuery, useJoinLobbyMutation } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { createPlayerFromSessionUser } from "@/utils/player"

type Props = {
  code: string
}

const JoinLobbyHandler = ({ code }: Props) => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const hasHandled = useRef(false)

  const { data: lobby, isLoading, isError } = useGetLobbyByCodeQuery({ code })
  const [joinLobby] = useJoinLobbyMutation()

  useEffect(() => {
    if (isLoading || hasHandled.current || !user) return

    hasHandled.current = true

    if (isError || !lobby) {
      toast.error("Lobby not found")
      router.replace(PAGES.HOME)

      return
    }

    if (lobby.status !== LOBBY_STATUS.WAITING) {
      toast.error("This lobby is no longer accepting players")
      router.replace(PAGES.HOME)

      return
    }

    const player = createPlayerFromSessionUser(user)

    joinLobby({ lobbyId: lobby.id, player })
      .unwrap()
      .then(() => {
        router.replace(`${PAGES.LOBBY}/${lobby.id}`)
      })
      .catch(() => {
        toast.error("Failed to join lobby")
        router.replace(PAGES.HOME)
      })
  }, [isLoading, isError, lobby, user, router, joinLobby])

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Joining lobby...</p>
    </main>
  )
}

export default JoinLobbyHandler
