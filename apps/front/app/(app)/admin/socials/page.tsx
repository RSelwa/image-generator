"use client"

import { getDateString, SOCIALS_STATUS, SOCIALS_STATUS_WORDING } from "@repo/common"
import { type SocialDocWithId } from "@repo/schemas"
import { PlusIcon, RefreshCcw, Search, Trash2 } from "lucide-react"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import { useRef, useState } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import SocialSheet from "@/components/sheet/social-sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSocialRef } from "@/constants/db-refs"
import { MODAL_KEYS, QUERY_PARAMS } from "@/constants/mapping"
import { SOCIALS_STATUS_TO_BADGE_VARIANT } from "@/constants/social"
import { useModal } from "@/hooks/use-modal"
import { useDeleteSocialByIdMutation, useGetAllSocialsQuery, useRetriggerPostProductionMutation, useUpdateSocialByIdMutation } from "@/redux/api/socials"

const SocialRow = ({ social, checkedIds, setCheckedIds }: {
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
                            <Badge variant={SOCIALS_STATUS_TO_BADGE_VARIANT[social.status]}>
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
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    )
}

const Page = () => {
    const { openModal } = useModal(MODAL_KEYS.NEW_SOCIALS, "new")

    const [deleteSocialById] = useDeleteSocialByIdMutation()
    const { data: socials, isLoading, refetch } = useGetAllSocialsQuery()
    const captionRef = useRef<HTMLTableCaptionElement>(null)

    const [input, setInput] = useState("")
    const [checkedIds, setCheckedIds] = useState<string[]>([])

    const hasChecked = checkedIds.length > 0
    const isAllChecked = socials ? socials.length > 0 && socials.every((social) => checkedIds.includes(social.id)) : false

    const toggleAllChecked = (value: boolean) => {
        if (!socials) return

        setCheckedIds(value ? socials.map((social) => social.id) : [])
    }

    const deleteSocials = async () => {
        await Promise.all(checkedIds.map((id) => deleteSocialById({ id })))
        setCheckedIds([])
    }

    if (!socials) {
        return (
            <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
                <section className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold">
                        Socials
                    </h1>
                </section>
                <div className="flex items-center justify-center h-5/6">
                    {isLoading ? "Loading..." : "No socials found"}
                </div>
            </main>
        )
    }

    return (
        <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
            <section className="flex flex-col gap-2 lg:gap-4 lg:flex-row justify-between lg:items-center">
                <h1 className="text-2xl font-bold space-x-4">
                    Socials -
                    {" "}
                    <span className="text-primary">{socials?.length}</span>
                    <Button size="icon" variant="marathon-white" onClick={refetch}>
                        <RefreshCcw className="size-4" />
                    </Button>
                </h1>
                <InputGroup className="lg:w-fit w-full min-w-72">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by id" autoComplete="off" />
                </InputGroup>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="marathon-destructive" className="lg:ml-auto" disabled={!hasChecked}>
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete socials</AlertDialogTitle>
                            <AlertDialogDescription> Are you sure you want to delete the selected socials? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                                <Button variant="marathon-outline" className="rounded-none">
                                    Cancel
                                </Button>
                            </AlertDialogCancel>
                            <AlertDialogAction variant="marathon-destructive" asChild>
                                <Button
                                    disabled={checkedIds.length === 0}
                                    onClick={deleteSocials}
                                >
                                    Yes, delete {checkedIds.length} social{checkedIds.length > 1 ? "s" : ""}
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => openModal()}>
                    <PlusIcon className="size-4" />
                    New Social
                </Button>
            </section>
            <ScrollArea className="h-5/6 w-full m-0">
                <Table noWrapper>
                    <TableCaption ref={captionRef}>
                        {isLoading && "Loading..."}
                        {!isLoading && "All suggestions loaded"}
                    </TableCaption>
                    <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                            <TableHead className="w-14"><Checkbox checked={isAllChecked} onCheckedChange={toggleAllChecked} /></TableHead>
                            <TableHead className="w-14">Id</TableHead>
                            <TableHead className="w-25">Status</TableHead>
                            <TableHead>Created by</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {socials.map((social) => <SocialRow key={social.id} {...{ social, setCheckedIds, checkedIds }} />)}
                    </TableBody>
                </Table>
            </ScrollArea>
            <SocialSheet />
        </main>
    )
}

export default Page
