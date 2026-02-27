"use client"

import { getDateString } from "@repo/common"
import { type SoundDocWithId } from "@repo/schemas"
import { PlusIcon, RefreshCcw, Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import { useRef, useState } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import SoundSheet from "@/components/sheet/sound-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSoundRef } from "@/constants/db-refs"
import { MODAL_KEYS, QUERY_PARAMS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useGetAllSoundsQuery, useUpdateSoundByIdMutation } from "@/redux/api/sounds"
import { getBadgeTextBoolean, getBadgeVariantBoolean, getBadgeVariantSounds } from "@/utils/badge"

const SocialRow = ({ sound, checkedIds, setCheckedIds }: {
    sound: SoundDocWithId
    checkedIds: string[]
    setCheckedIds: Dispatch<SetStateAction<string[]>>
}) => {
    const [_, setSoundId] = useQueryState(QUERY_PARAMS.SOUND_ID)

    const [updateSoundDoc, { isLoading: isLoadingUpdate }] = useUpdateSoundByIdMutation()
    const checked = checkedIds.includes(sound.id)
    const onCheckedChange = (value: boolean) =>
        setCheckedIds((prev) => value ? [...prev, sound.id] : prev.filter((id) => id !== sound.id))

    const disabled = isLoadingUpdate

    return (
        <TableRow key={sound.id} onClick={() => setSoundId(sound.id)} data-viewed={Boolean(sound.createdAt)} className="data-[viewed=false]:bg-muted/50 cursor-pointer">
            <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
            </TableCell>
            <TableCell className="truncate lg:w-auto w-14">
                {sound.id}
                <OpenFirestoreDoc docRef={getSoundRef(sound.id)} />
            </TableCell>
            <TableCell>
                <Badge variant={getBadgeVariantSounds(sound.status)}>
                    {sound.status}
                </Badge>
            </TableCell>
            <TableCell>
                <Switch
                    disabled={disabled}
                    checked={sound.canBeUsedInPosts}
                    onCheckedChange={async (checked) => await updateSoundDoc({
                        id: sound.id,
                        data: { canBeUsedInPosts: checked }
                    })}
                    onClick={(e) => e.stopPropagation()}
                />
            </TableCell>
            <TableCell>
                <Badge variant={getBadgeVariantBoolean(Boolean(sound.storagePath))}>
                    {getBadgeTextBoolean(Boolean(sound.storagePath))}
                </Badge>
            </TableCell>
            <TableCell>{sound.youtubeTitle}</TableCell>
            <TableCell className="font-medium">{getDateString(sound.createdAt?.toDate())}</TableCell>

        </TableRow>
    )
}

const Page = () => {
    const { openModal } = useModal(MODAL_KEYS.NEW_SOUND, "new")

    const { data: sounds, isLoading, refetch } = useGetAllSoundsQuery()
    const captionRef = useRef<HTMLTableCaptionElement>(null)

    const [input, setInput] = useState("")
    const [checkedIds, setCheckedIds] = useState<string[]>([])

    const isAllChecked = sounds ? sounds.length > 0 && sounds.every((sound) => checkedIds.includes(sound.id)) : false

    const toggleAllChecked = (value: boolean) => {
        if (!sounds) return

        setCheckedIds(value ? sounds.map((sound) => sound.id) : [])
    }

    if (!sounds) {
        return (
            <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
                <section className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold">
                        Sounds
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
            <section className="flex flex-col gap-2 lg:gap-8 lg:flex-row justify-between lg:items-center">
                <h1 className="text-2xl font-bold space-x-4">
                    Sounds -
                    {" "}
                    <span className="text-primary">{sounds?.length}</span>
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
                <Button onClick={() => openModal()} className="lg:ml-auto">
                    <PlusIcon className="size-4" />
                    New Sound
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
                            <TableHead className="w-14">Status</TableHead>
                            <TableHead className="w-14">Usable</TableHead>
                            <TableHead className="w-14">Has storage</TableHead>
                            <TableHead className="w-14">Title</TableHead>
                            <TableHead className="w-14">Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sounds.map((sound) => <SocialRow key={sound.id} {...{ sound, setCheckedIds, checkedIds }} />)}
                    </TableBody>
                </Table>
            </ScrollArea>
            <SoundSheet />
        </main>
    )
}

export default Page
