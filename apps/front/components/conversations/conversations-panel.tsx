"use client"

import { type Timestamp } from "@firebase/firestore"
import { ChevronLeft, MessageSquare, X } from "lucide-react"
import { useEffect, useState } from "react"
import { ConversationThread } from "@/components/conversations/conversation-thread"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "@/i18n/routing"
import { useSubscribeConversationMessagesQuery, useSubscribeConversationsQuery } from "@/redux/api/conversations"
import { useSubscribeLobbyMessagesQuery } from "@/redux/api/messages"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn, getLobbyIdFromPathname } from "@/utils"

type Tab = "lobby" | "messages"

const toMillis = (ts: Timestamp | null | undefined) =>
  ts ? ts.toMillis() : 0

export const ConversationsPanel = () => {
  const uid = useAppSelector(selectUserId)
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("lobby")
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const { data: conversations = [] } = useSubscribeConversationsQuery({ uid }, { skip: !uid })
  const { data: lobbyConversationMessages = [] } = useSubscribeConversationMessagesQuery(
    { conversationId: `lobby_${lobbyId}` },
    { skip: !lobbyId },
  )
  // keep subscribing to old lobby messages so toasts still fire via useLobbyMessagesListener
  useSubscribeLobbyMessagesQuery({ lobbyId }, { skip: !lobbyId })
  useEffect(() => {
    setTab(lobbyId ? "lobby" : "messages")
    setSelectedConversationId(null)
  }, [lobbyId])

  const sortedConversations = [...conversations].sort(
    (a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt),
  )

  const getOtherParticipant = (participants: string[]) =>
    participants.find((p) => p !== uid) || ""

  const inThread = tab === "messages" && selectedConversationId !== null

  const lobbyUnread = lobbyConversationMessages.filter((m) => uid && !m.seenBy.includes(uid) && m.senderId !== uid).length
  const unreadCount = lobbyUnread

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 border bg-background rounded-lg shadow-xl flex flex-col overflow-hidden" style={{ height: 420 }}>
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50 shrink-0">
            <div className="flex items-center gap-1">
              {inThread && (
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              {!inThread && lobbyId ? (
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setTab("lobby")}
                    className={cn(
                      "px-2 py-1 rounded transition-colors",
                      tab === "lobby" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    Salon
                  </button>
                  <button
                    onClick={() => setTab("messages")}
                    className={cn(
                      "px-2 py-1 rounded transition-colors",
                      tab === "messages" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    Messages
                  </button>
                </div>
              ) : (
                <span className="text-sm font-medium">
                  {inThread ? "Conversation" : "Messages"}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {tab === "lobby" && (
              <ScrollArea className="h-full p-2">
                {lobbyConversationMessages.length === 0 && (
                  <p className="text-muted-foreground text-xs text-center py-4">Aucun message dans le salon</p>
                )}
                <div className="space-y-2">
                  {lobbyConversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded px-3 py-2 text-sm",
                        msg.senderId === uid
                          ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {msg.senderId !== uid && (
                        <p className="text-xs text-muted-foreground font-mono mb-0.5 truncate">{msg.senderId.slice(0, 10)}…</p>
                      )}
                      {msg.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {tab === "messages" && !inThread && (
              <ScrollArea className="h-full">
                {sortedConversations.length === 0 && (
                  <p className="text-muted-foreground text-xs text-center py-4">Aucune conversation</p>
                )}
                <div className="divide-y">
                  {sortedConversations.map((conversation) => {
                    const otherUid = getOtherParticipant(conversation.participants)
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors"
                      >
                        <div className="text-xs font-mono text-muted-foreground truncate">
                          {otherUid.slice(0, 16)}…
                        </div>
                        {conversation.lastMessage && (
                          <div className="text-xs mt-0.5 truncate text-foreground">
                            {conversation.lastMessage}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}

            {tab === "messages" && inThread && (
              <ConversationThread conversationId={selectedConversationId} />
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative size-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <MessageSquare className="size-5" />
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
