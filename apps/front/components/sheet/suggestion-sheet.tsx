"use client"

import { Timestamp } from "@firebase/firestore"
import { EyeOff } from "lucide-react"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { EmptySheet } from "@/components/sheet/empty"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useDeleteSuggestionMutation, useGetSuggestionByIdQuery, useUpdateSuggestionMutation } from "@/redux/api/suggestions"

export const SuggestionSheet = () => {
    const [suggestionId, setSuggestionId] = useQueryState(QUERY_PARAMS.SUGGESTION_ID)

    const { data: suggestion } = useGetSuggestionByIdQuery({ id: suggestionId || "" }, { skip: !suggestionId })
    const [updateSuggestion] = useUpdateSuggestionMutation()
    const [deleteSuggestion] = useDeleteSuggestionMutation()

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
