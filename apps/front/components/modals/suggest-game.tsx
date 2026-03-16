import { zodResolver } from "@hookform/resolvers/zod"
import { SUGGESTIONS_TYPE } from "@repo/common"
import { suggestionsDocSchema } from "@repo/schemas"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Loader from "@/components/icons/loader"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateSuggestionMutation } from "@/redux/api/suggestions"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const key = MODAL_KEYS.SUGGEST_GAME

const formSchema = z.object({
  title: z.string().default(""),
  description: z.string().default("")
})
type FormSchema = z.infer<typeof formSchema>

export const SuggestGameModal = () => {
  const t = useTranslations("suggestGame")
  const tCommon = useTranslations("common")
  const { closeModal } = useModal(key)

  const userId = useAppSelector(selectUserId)

  const [createSuggestionDoc, { isLoading }] = useCreateSuggestionMutation()

  const { handleSubmit, register, reset } = useForm({
    defaultValues: formSchema.parse({}),
    resolver: zodResolver(formSchema),
  })

  const submitSuggestion = async (data: FormSchema) => {
    try {
      const suggestionDoc = suggestionsDocSchema.parse({
        type: SUGGESTIONS_TYPE.GAME_SUGGESTIONS,
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

  return (
    <ModalBase title={t("title")} modalKey={key}>
      <form autoComplete="off" onSubmit={handleSubmit(submitSuggestion)} className="space-y-4">
        <InputGroup>
          <InputGroupInput placeholder={t("gameTitle")} {...register("title")} />
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder={t("gameDescription")} {...register("description")} />
        </InputGroup>
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
