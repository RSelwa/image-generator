import { getDateString, SOCIALS_STATUS, SOCIALS_STATUS_WORDING } from "@repo/common"
import { type SocialDocWithId } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { getSocialRef } from "@/constants/db-refs"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useRetriggerPostProductionMutation, useUpdateSocialByIdMutation } from "@/redux/api/socials"
import { getBadgeVariantSocials } from "@/utils/badge"

export const SocialRow = ({ social, checkedIds, setCheckedIds }: {
    social: SocialDocWithId
    checkedIds: string[]
    setCheckedIds: Dispatch<SetStateAction<string[]>>
}) => {
    const [_, setSocialId] = useQueryState(QUERY_PARAMS.SOCIAL_ID)

    const [updateSocialDoc] = useUpdateSocialByIdMutation()
    const [retriggerPostProduction] = useRetriggerPostProductionMutation()

    const checked = checkedIds.includes(social.id)
    const onCheckedChange = (value: boolean) =>
        setCheckedIds((prev) => value ? [...prev, social.id] : prev.filter((id) => id !== social.id))

    const reloadCapture = async () => {
        try {
            await updateSocialDoc({
                id: social.id,
                data: {
                    status: SOCIALS_STATUS.WAITING_CAPTURE,
                    errorInfo: null,
                },
            }).unwrap()

            setSocialId(social.id)
        } catch (error) {
            console.error("Error retriggering post production:", error)
        }
    }

    return (
        <AlertDialog>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <TableRow key={social.id} onClick={() => setSocialId(social.id)} data-viewed={Boolean(social.createdAt)} className="data-[viewed=false]:bg-muted/50 cursor-pointer">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                                checked={checked}
                                onCheckedChange={onCheckedChange}
                            />
                        </TableCell>
                        <TableCell className="truncate lg:w-auto w-14">
                            {social.id}
                            <OpenFirestoreDoc docRef={getSocialRef(social.id)} />

                        </TableCell>
                        <TableCell>
                            {social.status && (
                                <Badge variant={getBadgeVariantSocials(social.status)}>
                                    {SOCIALS_STATUS_WORDING[social.status]}
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">{getDateString(social.createdAt?.toDate())}</TableCell>
                    </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    {social.errorInfo && (
                        <ContextMenuGroup>
                            <ContextMenuLabel>Errors</ContextMenuLabel>
                            <ContextMenuItem variant="destructive" onClick={reloadCapture}>
                                Reload capture
                            </ContextMenuItem>
                        </ContextMenuGroup>
                    )}
                    <ContextMenuGroup>
                        <ContextMenuLabel>Actions</ContextMenuLabel>
                        <ContextMenuItem onClick={() => retriggerPostProduction({ id: social.id })}>
                            Redo Post production
                        </ContextMenuItem>
                        {social.status === SOCIALS_STATUS.READY_TO_POST && (
                            <AlertDialogTrigger asChild>
                                <ContextMenuItem asChild>
                                    <Button variant="marathon" className="rounded-none cursor-pointer w-full justify-start">
                                        Publish
                                    </Button>
                                </ContextMenuItem>
                            </AlertDialogTrigger>
                        )}
                    </ContextMenuGroup>
                </ContextMenuContent>
            </ContextMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>View details</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to view the details of this social? It will mark the social as viewed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <section className="flex justify-center">
                    {social.urlCustomizedVideoStorage && (
                        <video controls className="h-96">
                            <source src={social.urlCustomizedVideoStorage} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </section>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="marathon-outline" className="rounded-none">
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction variant="marathon" asChild>
                        <Button
                            onClick={() => updateSocialDoc({
                                id: social.id,
                                data: {
                                    status: SOCIALS_STATUS.WAITING_FOR_POST,
                                },
                            })}
                        >
                            Yes, Publish
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
