import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-dropdown-menu"
import { SOUND_STATUS } from "@repo/common"
import { soundDocSchema } from "@repo/schemas"
import * as React from "react"
import { type SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import z from "zod"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import YoutubeEmbed from "@/components/youtube-embed"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateSoundMutation } from "@/redux/api/sounds"

const KEY = MODAL_KEYS.NEW_SOUND

const soundFormSchema = z.object({
    ...soundDocSchema.pick({
        youtubeLink: true,
        canBeUsedInPosts: true,
        status: true,
    }).shape
})

type SocialFormSchema = z.input<typeof soundFormSchema>

const NewSound = () => {
    const { closeModal } = useModal(KEY)

    const [createSound] = useCreateSoundMutation()

    const {
        handleSubmit,
        watch,
        reset,
        register
    } = useForm<SocialFormSchema>({
        resolver: zodResolver(soundFormSchema),
        defaultValues: {
            canBeUsedInPosts: true,
            status: SOUND_STATUS.WAITING_FOR_EXTRACTION,
        },
    })

    const onSubmit: SubmitHandler<SocialFormSchema> = async (formData) => {
        try {
            await createSound(formData).unwrap()

            reset()
            closeModal()
        } catch (error) {
            console.error("Error creating social:", error)
        }
    }

    return (
        <ModalBase modalKey={KEY} className="lg:max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8 space-y-4">
                <section className="flex flex-col items-center gap-8 justify-between">
                    <Field>
                        <Label className="text-lg">Youtube Link</Label>
                        <Input {...register("youtubeLink")} placeholder="https://www.youtube.com/watch?v=..." />
                        {watch("youtubeLink") && (
                            <YoutubeEmbed youtubeLink={watch("youtubeLink") || ""} />

                        )}
                    </Field>
                    <Field>
                        <FieldLabel> Can be used for imports</FieldLabel>
                        <Switch {...register("canBeUsedInPosts")} />
                    </Field>
                    <Field>
                        <Select {...register("status")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="h-64">
                                {Object.values(SOUND_STATUS).map((sound) => (
                                    <SelectItem key={sound} value={sound}>
                                        {sound}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

export default NewSound
