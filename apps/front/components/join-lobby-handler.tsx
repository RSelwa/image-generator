"use client"

import { LOBBY_STATUS } from "@repo/common"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { QUERY_PARAMS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useRouter } from "@/i18n/routing"
import { useGetLobbyByCodeQuery, useJoinLobbyMutation } from "@/redux/api/lobby"
import { selectSessionIsReady, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { createPlayerFromSessionUser } from "@/utils/player"

type Props = {
  code: string
}

const JoinLobbyHandler = ({ code }: Props) => {
  const t = useTranslations("lobby")
  const router = useRouter()

  const user = useAppSelector(selectUser)
  const isSessionReady = useAppSelector(selectSessionIsReady)

  const hasHandled = useRef(false)

  const { data: lobby, isLoading, isError } = useGetLobbyByCodeQuery({ code })
  const [joinLobby] = useJoinLobbyMutation()

  useEffect(() => {
    if (isLoading || hasHandled.current || (!user && !isSessionReady)) return

    hasHandled.current = true

    if (isError || !lobby) {
      toast.error(t("lobbyNotFound"))
      router.replace(PAGES.HOME)

      return
    }

    if (lobby.status !== LOBBY_STATUS.WAITING) {
      toast.error(t("lobbyNoLongerAccepting"))
      router.replace(PAGES.HOME)

      return
    }

    if ((isSessionReady && (!user || user.isAnonymous)) || !user) {
      toast.error(t("mustBeLogged"))
      const searchParams = new URLSearchParams({ [QUERY_PARAMS.REDIRECT]: `${PAGES.JOIN_LOBBY}/${lobby.code}` })
      const url = new URL(`${PAGES.LOGIN}?${searchParams.toString()}`, window.location.origin)
      router.replace(url.href)

      return
    }

    const player = createPlayerFromSessionUser(user)

    joinLobby({ lobbyId: lobby.id, player })
      .unwrap()
      .then(() => {
        router.replace(`${PAGES.LOBBY}/${lobby.id}`)
      })
      .catch(() => {
        toast.error(t("failedToJoin"))
        router.replace(PAGES.HOME)
      })
  }, [isLoading, isError, lobby, user, router, joinLobby, user?.isAnonymous])

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-primary-foreground">{t("joining")}</p>
    </main>
  )
}

export default JoinLobbyHandler
