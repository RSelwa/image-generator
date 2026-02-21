import { zodResolver } from "@hookform/resolvers/zod"
import { SUGGESTIONS_TYPE } from "@repo/common"
import { suggestionsDocSchema } from "@repo/schemas"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Loader from "@/components/icons/loader"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateSuggestionMutation } from "@/redux/api/suggestions"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const key = MODAL_KEYS.MAKE_SUGGESTION

const formSchema = z.object({
    title: z.string().default(""),
    description: z.string().default("")
})
type FormSchema = z.infer<typeof formSchema>

export const MakeSuggestion = () => {
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
                type: SUGGESTIONS_TYPE.SUGGESTIONS,
                title: data.title,
                message: data.description,
                createdBy: userId
            })

            await createSuggestionDoc(suggestionDoc).unwrap()

            toast.success("Thanks for your suggestion! You help to improve this project :)")
            reset()
            closeModal()
        } catch (error) {
            console.error("Failed to submit suggestion", error)

            toast.error("Failed to submit suggestion")
        }
    }

    return (
        <ModalBase title="Make a suggestion" modalKey={key}>
            <form autoComplete="off" onSubmit={handleSubmit(submitSuggestion)} className="space-y-4">
                <InputGroup>
                    <InputGroupInput placeholder="What is your suggestions" {...register("title")} />
                </InputGroup>
                <InputGroup>
                    <InputGroupTextarea placeholder="Describe your suggestion" {...register("description")} />
                </InputGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="marathon-outline">

                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        Submit {isLoading && <Loader />}
                    </Button>
                </DialogFooter>

            </form>

        </ModalBase>
    )
}
