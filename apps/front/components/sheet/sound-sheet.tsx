import { SelectTrigger } from "@radix-ui/react-select"
import { SOUND_STATUS } from "@repo/common"
import { soundDocSchema } from "@repo/schemas"
import { useQueryState } from "nuqs"
import * as React from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { EmptySheet } from "@/components/sheet/empty"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import YoutubeEmbed from "@/components/youtube-embed"
import { getSoundRef } from "@/constants/db-refs"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useDeleteSoundByIdMutation, useGetSoundByIdQuery, useUpdateSoundByIdMutation } from "@/redux/api/sounds"

const SoundSheet = () => {
    const [soundId, setSoundId] = useQueryState(QUERY_PARAMS.SOUND_ID)
    const open = Boolean(soundId)

    const [updateSoundDoc, { isLoading: isLoadingUpdate }] = useUpdateSoundByIdMutation()
    const [deleteSoundById, { isLoading }] = useDeleteSoundByIdMutation()
    const { data: sound } = useGetSoundByIdQuery({ id: soundId || "" }, { skip: !soundId, refetchOnMountOrArgChange: true })

    if (!sound || !soundId) return <Sheet open={open} onOpenChange={(open) => !open && setSoundId(null)}><EmptySheet /></Sheet>

    const close = async (open: boolean) => {
        if (open) return

        setSoundId(null)
    }

    const deleteSound = async () => {
        await deleteSoundById({ id: soundId })
        close(false)
    }

    return (
        <Sheet key={soundId} open={open} onOpenChange={close}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        {sound.youtubeTitle}
                    </SheetTitle>
                    <SheetDescription>
                        {sound.id} <OpenFirestoreDoc docRef={getSoundRef(soundId)} />
                    </SheetDescription>
                </SheetHeader>
                <section className="space-y-2">
                    <p>Youtube Id: {sound.youtubeId}</p>
                    {sound.storagePath && (
                        <audio controls className="w-full mb-4">
                            <source src={sound.storagePath} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    )}
                    {sound.youtubeLink && (
                        <YoutubeEmbed
                            youtubeLink={sound.youtubeLink}
                            opts={{
                                height: "100%",
                                width: "100%",
                            }}
                            className="w-full h-72"
                        />
                    )}
                </section>
                <ScrollArea className="h-5/6 space-y-2" />
                <SheetFooter>
                    <Select
                        disabled={isLoadingUpdate}
                        value={sound.status || ""}
                        onValueChange={async (value) => {
                            const parsedStatus = soundDocSchema.pick({ status: true }).safeParse({ status: value })

                            if (!parsedStatus.success) return

                            await updateSoundDoc({
                                id: soundId,
                                data: {
                                    status: parsedStatus.data.status
                                }
                            })
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(SOUND_STATUS).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="marathon-destructive">
                                Delete sound
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sound</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this sound? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                    <Button variant="marathon-outline" className="rounded-none">
                                        Cancel
                                    </Button>
                                </AlertDialogCancel>
                                <Button variant="marathon-destructive" disabled={isLoading} onClick={deleteSound}>
                                    Yes, delete sound
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SheetFooter>
            </SheetContent>

        </Sheet>
    )
}

export default SoundSheet
