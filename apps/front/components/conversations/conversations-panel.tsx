"use client"

import { type Timestamp } from "@firebase/firestore"
import { type ConversationDocWithId } from "@repo/schemas"
import { ChevronLeft, MessageSquare, X } from "lucide-react"
import { useEffect, useState } from "react"
import { ConversationThread } from "@/components/conversations/conversation-thread"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/ui/user-avatar"
import { getLobbyConversationId } from "@/constants/db-refs"
import { usePathname } from "@/i18n/routing"
import { useSubscribeConversationQuery, useSubscribeConversationsQuery } from "@/redux/api/conversations"
import { useGetUserByIdQuery } from "@/redux/api/user"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const LOBBY_CONVERSATION_NAME = "Salon"

const toMillis = (timestamp: Timestamp | null | undefined) => timestamp ? timestamp.toMillis() : 0

const hasUnread = (conversation: ConversationDocWithId, uid: string) =>
  toMillis(conversation.lastMessageAt) > toMillis(conversation.lastReadAt[uid])

type ConversationRowProps = {
  conversation: ConversationDocWithId
  uid: string
  onSelect: () => void
}

const ConversationRow = ({ conversation, uid, onSelect }: ConversationRowProps) => {
  const otherUid = conversation.lobbyId ? "" : conversation.participants.find((participant) => participant !== uid) || uid

  const { data: user } = useGetUserByIdQuery({ id: otherUid }, { skip: !otherUid })

  const name = conversation.lobbyId ? LOBBY_CONVERSATION_NAME : user?.pseudo || user?.email || ""
  const isUnread = hasUnread(conversation, uid)

  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted transition-colors"
    >
      <UserAvatar avatar={user?.avatar || undefined} name={name} donorTier={user?.donorTier} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{name}</div>
        {conversation.lastMessage && (
          <div className="text-xs mt-0.5 truncate text-muted-foreground">{conversation.lastMessage}</div>
        )}
      </div>
      {isUnread && <span className="size-2 rounded-full bg-destructive shrink-0" />}
    </button>
  )
}

export const ConversationsPanel = () => {
  const uid = useAppSelector(selectUserId)
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [open, setOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const { data: conversations = [] } = useSubscribeConversationsQuery({ uid }, { skip: !uid })
  const { data: lobbyConversation } = useSubscribeConversationQuery(
    { conversationId: getLobbyConversationId(lobbyId) },
    { skip: !lobbyId },
  )

  useEffect(() => {
    setSelectedConversationId(null)
  }, [lobbyId])

  const directConversations = conversations
    .filter((conversation) => !conversation.lobbyId)
    .sort((a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt))

  const visibleConversations = lobbyConversation ? [lobbyConversation, ...directConversations] : directConversations
  const unreadCount = visibleConversations.filter((conversation) => hasUnread(conversation, uid)).length

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 h-105 border bg-background rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50 shrink-0">
            <div className="flex items-center gap-1">
              {selectedConversationId && (
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              <span className="text-sm font-medium">
                {selectedConversationId ? "Conversation" : "Messages"}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {!selectedConversationId && (
              <ScrollArea className="h-full">
                {visibleConversations.length === 0 && (
                  <p className="text-muted-foreground text-xs text-center py-4">Aucune conversation</p>
                )}
                <div className="divide-y">
                  {visibleConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      uid={uid}
                      onSelect={() => setSelectedConversationId(conversation.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}

            {selectedConversationId && (
              <ConversationThread conversationId={selectedConversationId} />
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((isOpen) => !isOpen)}
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
