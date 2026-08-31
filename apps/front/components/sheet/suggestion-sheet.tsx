"use client"

import { Timestamp } from "@firebase/firestore"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeOff, Loader } from "lucide-react"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { EmptySheet } from "@/components/sheet/empty"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UserAvatar } from "@/components/ui/user-avatar"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useFindOrCreateConversationMutation, useSendConversationMessageMutation } from "@/redux/api/conversations"
import { useDeleteSuggestionMutation, useGetSuggestionByIdQuery, useUpdateSuggestionMutation } from "@/redux/api/suggestions"
import { useGetUserByIdQuery } from "@/redux/api/user"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const messageFormSchema = z.object({
    content: z.string().min(1),
})
type MessageFormSchema = z.infer<typeof messageFormSchema>

export const SuggestionSheet = () => {
    const [suggestionId, setSuggestionId] = useQueryState(QUERY_PARAMS.SUGGESTION_ID)
    const adminId = useAppSelector(selectUserId)

    const { data: suggestion } = useGetSuggestionByIdQuery({ id: suggestionId || "" }, { skip: !suggestionId })
    const { data: userSuggestion } = useGetUserByIdQuery({ id: suggestion?.createdBy || "" }, { skip: !suggestion?.createdBy })

    const [findOrCreateConversation] = useFindOrCreateConversationMutation()
    const [sendConversationMessage, { isLoading: isLoadingSendingMessage }] = useSendConversationMessageMutation()
    const [updateSuggestion] = useUpdateSuggestionMutation()
    const [deleteSuggestion] = useDeleteSuggestionMutation()

    const { handleSubmit, register, reset } = useForm<MessageFormSchema>({
        defaultValues: { content: "" },
        resolver: zodResolver(messageFormSchema),
    })

    const open = Boolean(suggestionId)

    if (!suggestion) return <Sheet open={open} onOpenChange={(open) => !open && setSuggestionId(null)}><EmptySheet /></Sheet>

    const hasImages = suggestion.imagesUrls && suggestion.imagesUrls.length > 0

    const markAsUnread = () => {
        updateSuggestion({ id: suggestion.id, viewedAt: null })
        setSuggestionId(null)
    }

    const close = async (open: boolean) => {
        if (open) return
        updateSuggestion({ id: suggestion.id, viewedAt: Timestamp.now() })
        setSuggestionId(null)
    }

    const handleDelete = async () => {
        await deleteSuggestion({ id: suggestion.id })
        setSuggestionId(null)
    }

    const onSubmit = async (data: MessageFormSchema) => {
        try {
            if (!userSuggestion || !adminId) return

            const conversation = await findOrCreateConversation({ uid: adminId, otherUid: userSuggestion.id }).unwrap()
            await sendConversationMessage({ conversationId: conversation.id, content: data.content, senderId: adminId }).unwrap()
            reset()
        } catch {
            toast.error("Erreur lors de l'envoi du message")
        }
    }

    return (
        <Sheet open={open} onOpenChange={close}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{suggestion.type}</SheetTitle>
                    <SheetDescription>{suggestion.id}</SheetDescription>
                </SheetHeader>
                <section className="px-4 font-shapiro">
                    <p className="mb-2"><span className="font-semibold">Title:</span> {suggestion.title}</p>
                    <p>
                        <span className="font-semibold">Message:</span>
                        <br />
                        {suggestion.message}
                    </p>
                </section>
                {userSuggestion && (
                    <section className="px-4 font-shapiro ">
                        <UserAvatar {...userSuggestion} avatar={userSuggestion?.avatar || ""} name={userSuggestion?.pseudo || "?"} />
                        <p>
                            {userSuggestion?.email}
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-end flex-1">
                            <InputGroup className="flex-1">
                                <InputGroupTextarea placeholder="Message..." {...register("content")} />
                            </InputGroup>
                            <Button type="submit" disabled={isLoadingSendingMessage} variant="outline">
                                Envoyer {isLoadingSendingMessage && <Loader />}
                            </Button>
                        </form>
                    </section>
                )}
                <section className="grid flex-1 lg:grid-cols-3 grid-cols-1 auto-rows-min gap-6 px-4">
                    {hasImages && suggestion.imagesUrls?.map((url, index) => (
                        <Image key={url} src={url} alt={`Suggestion image ${index + 1}`} width={200} height={200} className="rounded" />
                    ))}
                </section>
                <SheetFooter>
                    <Button variant="marathon-outline" onClick={markAsUnread}>
                        <EyeOff className="size-4" />
                        Mark as unread
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="marathon-destructive">
                                Delete suggestion
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this suggestion?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel variant="marathon-outline" asChild>
                                    <Button>
                                        No, keep it
                                    </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction variant="marathon-destructive" asChild onClick={handleDelete}>
                                    <Button>
                                        Yes, delete
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
