import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS, SUGGESTIONS_TYPE } from "@repo/common"
import { suggestionsDocSchema } from "@repo/schemas"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/routing"
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
import { selectCurrentRoundIndex, selectCurrentRoundInfos } from "@/redux/lobby/lobby.selectors"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import { uploadFileToBucket } from "@/utils/file"

const key = MODAL_KEYS.REPORT_BUG

const formSchema = z.object({
  title: z.string().default(""),
  description: z.string().default("")
})
type FormSchema = z.infer<typeof formSchema>

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const ReportBugModal = () => {
  const t = useTranslations("reportBug")
  const tCommon = useTranslations("common")
  const { closeModal } = useModal(key)

  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundInfos = useAppSelector(selectCurrentRoundInfos(lobbyId, roundIndex))
  const userId = useAppSelector(selectUserId)

  const [createSuggestionDoc, { isLoading }] = useCreateSuggestionMutation()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { handleSubmit, register, reset } = useForm({
    defaultValues: formSchema.parse({}),
    resolver: zodResolver(formSchema),
  })

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("imageTooLarge"))
      throw new Error("File too large")
    }

    setIsUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.SUGGESTIONS,
        title: "bug-report",
      })
      setImageUrls((prev) => [...prev, url])
    } catch (error) {
      console.error("Failed to upload image", error)
      toast.error(t("uploadFailed"))
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const submitBug = async (data: FormSchema) => {
    try {
      const suggestionDoc = suggestionsDocSchema.parse({
        type: SUGGESTIONS_TYPE.BUG,
        title: data.title,
        message: data.description,
        createdBy: userId,
        gameId: currentRoundInfos?.gameId,
        flatId: currentRoundInfos?.flatId,
        sphericalId: currentRoundInfos?.sphericalId,
        ...(imageUrls.length > 0 && { imagesUrls: imageUrls }),
      })

      await createSuggestionDoc(suggestionDoc).unwrap()

      toast.success(t("success"))
      reset()
      setImageUrls([])
      closeModal()
    } catch (error) {
      console.error("Failed to submit suggestion", error)

      toast.error(t("fail"))
    }
  }

  return (
    <ModalBase title={t("title")} modalKey={key}>
      <form autoComplete="off" onSubmit={handleSubmit(submitBug)} className="space-y-4">
        <InputGroup>
          <InputGroupInput placeholder={t("bugTitle")} {...register("title")} />
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder={t("describeProblem")} {...register("description")} />
        </InputGroup>
        <div className="flex flex-col lg:flex-row flex-wrap gap-2">
          <ImageDropzone
            key={imageUrls.length}
            imageUrl={null}
            onFileSelect={handleFileSelect}
            onRemove={() => { }}
            isUploading={isUploading}
            className="size-32"
            alt={t("screenshot")}
          />
          {imageUrls.map((url, index) => (
            <ImageDropzone
              key={url}
              imageUrl={url}
              onFileSelect={handleFileSelect}
              onRemove={() => handleRemoveImage(index)}
              className="size-32"
              alt={t("screenshotIndex", { index: index + 1 })}
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
