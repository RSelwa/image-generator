import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS, SUGGESTIONS_TYPE } from "@repo/common"
import { suggestionsDocSchema } from "@repo/schemas"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Loader from "@/components/icons/loader"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ImageDropzone } from "@/components/ui/image-dropzone"
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateSuggestionMutation } from "@/redux/api/suggestions"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { uploadFileToBucket } from "@/utils/file"

const key = MODAL_KEYS.MAKE_SUGGESTION

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
    title: z.string().default(""),
    description: z.string().default(""),
    imageUrls: z.array(z.string()).optional()
})
type FormSchema = z.infer<typeof formSchema>

export const MakeSuggestion = () => {
    const t = useTranslations("makeSuggestion")
    const tCommon = useTranslations("common")
    const { closeModal } = useModal(key)

    const userId = useAppSelector(selectUserId)

    const [createSuggestionDoc, { isLoading }] = useCreateSuggestionMutation()

    const [isUploading, setIsUploading] = useState(false)

    const { handleSubmit, register, reset, watch, setValue } = useForm({
        defaultValues: formSchema.parse({}),
        resolver: zodResolver(formSchema),
    })

    const handleFileSelect = async (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Image must be less than 5MB")
            throw new Error("File too large")
        }

        setIsUploading(true)
        try {
            const { url } = await uploadFileToBucket({
                file,
                bucketPath: STORAGE_PATHS.SUGGESTIONS,
                title: "bug-report",
            })
            setValue("imageUrls", [...(watch("imageUrls") || []), url], { shouldDirty: true })
        } catch (error) {
            console.error("Failed to upload image", error)
            toast.error("Failed to upload image")
            throw error
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveImage = (index: number) => {
        const currentUrls = watch("imageUrls") || []
        const newUrls = currentUrls.filter((_, i) => i !== index)
        setValue("imageUrls", newUrls, { shouldDirty: true })
    }

    const submitSuggestion = async (data: FormSchema) => {
        try {
            const suggestionDoc = suggestionsDocSchema.parse({
                type: SUGGESTIONS_TYPE.SUGGESTIONS,
                title: data.title,
                message: data.description,
                createdBy: userId
            })

            await createSuggestionDoc(suggestionDoc).unwrap()

            toast.success(t("success"))
            reset()
            closeModal()
        } catch (error) {
            console.error("Failed to submit suggestion", error)

            toast.error(t("fail"))
        }
    }

    const imageUrls = watch("imageUrls") || []

    return (
        <ModalBase title={t("title")} modalKey={key}>
            <form autoComplete="off" onSubmit={handleSubmit(submitSuggestion)} className="space-y-4">
                <InputGroup>
                    <InputGroupInput placeholder={t("suggestionTitle")} {...register("title")} />
                </InputGroup>
                <InputGroup>
                    <InputGroupTextarea autoFocus placeholder={t("describeYourSuggestion")} {...register("description")} />
                </InputGroup>
                <div className="flex flex-col lg:flex-row flex-wrap gap-2">
                    <ImageDropzone
                        key={imageUrls.length}
                        imageUrl={null}
                        onFileSelect={handleFileSelect}
                        onRemove={() => { }}
                        isUploading={isUploading}
                        className="size-32"
                        alt="screenshot"
                    />
                    {imageUrls.map((url, index) => (
                        <ImageDropzone
                            key={url}
                            imageUrl={url}
                            onFileSelect={handleFileSelect}
                            onRemove={() => handleRemoveImage(index)}
                            className="size-32"
                            alt={`screenshot ${index + 1}`}
                        />
                    ))}

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="marathon-outline">
                            {tCommon("cancel")}
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {tCommon("submit")} {isLoading && <Loader />}
                    </Button>
                </DialogFooter>

            </form>

        </ModalBase>
    )
}
