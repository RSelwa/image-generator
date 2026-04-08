"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useMarkMessageSeenMutation, useSubscribeLobbyMessagesQuery } from "@/redux/api/messages"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

export const useLobbyMessagesListener = (lobbyId: string) => {
  const uid = useAppSelector(selectUserId)
  const shownIds = useRef<Set<string>>(new Set())

  const { data: messages } = useSubscribeLobbyMessagesQuery({ lobbyId }, { skip: !lobbyId || !uid })
  const [markSeen] = useMarkMessageSeenMutation()

  useEffect(() => {
    if (!messages || !uid) return

    for (const message of messages) {
      if (message.seenBy.includes(uid)) continue
      if (shownIds.current.has(message.id)) continue

      shownIds.current.add(message.id)

      toast(message.content, { duration: 10000 })
      markSeen({ id: message.id, uid })
    }
  }, [messages, uid, markSeen])
}
