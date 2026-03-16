"use client"

import { PlusIcon, RefreshCcw, Search, Trash2 } from "lucide-react"
import { useRef, useState } from "react"
import { SocialRow } from "@/app/[locale]/(app)/admin/socials/row"
import SocialSheet from "@/components/sheet/social-sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useDeleteSocialByIdMutation, useGetAllSocialsQuery } from "@/redux/api/socials"

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
                            <TableHead className="w-20">Id</TableHead>
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
