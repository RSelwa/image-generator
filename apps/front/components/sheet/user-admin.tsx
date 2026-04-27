"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useQueryState } from "nuqs"
import { ConversationThread } from "@/components/conversations/conversation-thread"
import { EmptySheet } from "@/components/sheet/empty"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { UserAvatar } from "@/components/ui/user-avatar"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useFindOrCreateConversationMutation } from "@/redux/api/conversations"
import { useGetUserByIdQuery } from "@/redux/api/user"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const SheetAdminUser = () => {
    const [userId, setUserId] = useQueryState(QUERY_PARAMS.USER_ID)
    const adminId = useAppSelector(selectUserId)

    const { data: user } = useGetUserByIdQuery({ id: userId || "" }, { skip: !userId })
    const [findOrCreateConversation, { data: conversation, isLoading: isCreatingConversation }] = useFindOrCreateConversationMutation()

    const open = Boolean(userId)

    useEffect(() => {
        if (!userId || !adminId || !open) return

        findOrCreateConversation({ uid: adminId, otherUid: userId }).catch(() => {
            toast.error("Erreur lors du chargement de la conversation")
        })
    }, [userId, adminId, open, findOrCreateConversation])

    if (!user) return <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}><EmptySheet /></Sheet>

    return (
        <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>{user.email}</SheetTitle>
                    <SheetDescription>Id of the user {user.id}</SheetDescription>
                </SheetHeader>
                <section className="flex flex-col auto-rows-min gap-6 px-4">
                    <UserAvatar avatar={user.avatar || undefined} name={user.email || user.id} donorTier={user.donorTier} className="size-20" />
                    <article className="flex items-center gap-4">
                        <span>
                            Has newsletter: {user.newsletter ? "Yes" : "No"}
                        </span>
                        <Switch checked={user.newsletter || false} disabled />
                    </article>
                </section>
                <section className="px-4 flex flex-col flex-1 min-h-0">
                    <h3 className="font-semibold text-sm mb-2">Conversation</h3>
                    {isCreatingConversation && (
                        <p className="text-muted-foreground text-sm">Chargement…</p>
                    )}
                    {!isCreatingConversation && conversation && (
                        <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                            <ConversationThread conversationId={conversation.id} />
                        </div>
                    )}
                </section>
            </SheetContent>
        </Sheet>
    )
}

export default SheetAdminUser
