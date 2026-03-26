import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-dropdown-menu"
import { DEFAULT_DURATION_SECONDS, getRandomHook, SOCIALS_HOOKS, SOCIALS_STATUS } from "@repo/common"
import { socialDocSchema } from "@repo/schemas"
import Image from "next/image"
import * as React from "react"
import { type SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import z from "zod"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Field, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import YoutubeEmbed from "@/components/youtube-embed"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateSocialMutation } from "@/redux/api/socials"
import { useGetSphericalsInfiniteQuery } from "@/redux/api/spherical"

const KEY = MODAL_KEYS.NEW_SOCIALS

const socialFormSchema = z.object({
    ...socialDocSchema.pick({
        sphericalId: true,
        gameId: true,
        duration: true,
        hook: true,
        youtubeLink: true,
        status: true,
        urlSphericalVideoStorage: true,
    }).shape
})

type SocialFormSchema = z.input<typeof socialFormSchema>

const NewSocial = () => {
    const { closeModal } = useModal(KEY)

    const [createSocial] = useCreateSocialMutation()

    const { data } = useGetSphericalsInfiniteQuery({})
    const allSphericals = data?.pages.flat() || []

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        register
    } = useForm<SocialFormSchema>({
        resolver: zodResolver(socialFormSchema),
        defaultValues: {
            duration: DEFAULT_DURATION_SECONDS,
            hook: getRandomHook(),
            status: SOCIALS_STATUS.WAITING_JOB_START,
        },
    })

    const onSubmit: SubmitHandler<SocialFormSchema> = async (formData) => {
        try {
            await createSocial({ ...formData, status: SOCIALS_STATUS.WAITING_CAPTURE, hook: getRandomHook() }).unwrap()

            reset()
            closeModal()
        } catch (error) {
            console.error("Error creating social:", error)
        }
    }

    return (
        <ModalBase modalKey={KEY} className="lg:max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8 space-y-4">
                <section className="flex items-center gap-8 justify-between">
                    <Field>
                        <Popover>
                            <PopoverTrigger data-hasImage={Boolean(watch("sphericalId"))} className="data-[hasImage=true]:border-muted flex items-center justify-center data-[hasImage=false]:border-primary border p-2 size-32! border-dashed">
                                {watch("sphericalId") && <Image src={allSphericals.find((s) => s.id === watch("sphericalId"))?.image || ""} alt="Selected Spherical" width={112} height={112} className="aspect-square object-cover " />}
                            </PopoverTrigger>
                            <PopoverContent asChild>
                                <ScrollArea className="h-64 w-96">
                                    <div className=" grid grid-cols-5 gap-4">

                                        {allSphericals?.map((spherical) => (
                                            <button
                                                key={spherical.id}
                                                value={spherical.id}
                                                className="font-mono"
                                                onClick={() => {
                                                    setValue("sphericalId", spherical.id, { shouldDirty: true })
                                                    setValue("gameId", spherical.gameId, { shouldDirty: true })
                                                }}
                                            >
                                                <img src={spherical.image} alt={spherical.game.title} className="size-16 object-cover" />
                                            </button>
                                        ))}
                                    </div>

                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </Field>
                    <Field>
                        <Label className="text-lg">Youtube Link</Label>
                        <Input {...register("youtubeLink")} placeholder="https://www.youtube.com/watch?v=..." />
                        {watch("youtubeLink") && (
                            <YoutubeEmbed youtubeLink={watch("youtubeLink") || ""} />

                        )}
                    </Field>
                </section>
                <section className="flex items-center gap-8 justify-between">
                    <Field>
                        <Select {...register("hook")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your hook" />
                            </SelectTrigger>
                            <SelectContent className="h-64">
                                {Object.values(SOCIALS_HOOKS).map((hook) => (
                                    <SelectItem key={hook} value={hook}>
                                        {hook}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field className="mx-auto grid w-full max-w-xs gap-3">
                        <FieldContent className="flex flex-row items-center justify-between gap-2">
                            <Label>Duration</Label>
                            <div className="text-muted-foreground text-sm">
                                {watch("duration")}
                            </div>
                        </FieldContent>
                        <Slider
                            id="slider-demo-temperature"
                            step={1}
                            min={5}
                            max={60}
                            value={[watch("duration") || 5]}
                            onValueChange={([val]) => setValue("duration", val, { shouldDirty: true })}
                        />
                    </Field>
                </section>
                <section className="flex items-center gap-8 justify-between">
                    <Field>
                        <Select {...register("status")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="h-64">
                                {Object.values(SOCIALS_STATUS).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <Label className="text-lg">Url spherical video storage</Label>
                        <Input {...register("urlSphericalVideoStorage")} placeholder="Paste here the url of raw video storage" />
                    </Field>
                </section>
                <section className="flex justify-end items-center gap-2">
                    <Button type="submit">
                        Create
                    </Button>
                </section>
            </form>
        </ModalBase>
    )
}

export default NewSocial
