import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { type SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "@/components/icons/loader"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useUpdateUserDocMutation } from "@/redux/api/user"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const key = MODAL_KEYS.CHANGE_PSEUDO

const formSchema = z.object({
  pseudo: z.string().min(3, "Pseudo must be at least 3 characters").max(30, "Pseudo must be at most 30 characters"),
})
type FormSchema = z.infer<typeof formSchema>

const ChangePseudoModal = () => {
  const { closeModal } = useModal(key)

  const user = useAppSelector(selectUser)

  const [updateUserDoc, { isLoading }] = useUpdateUserDocMutation()

  const {
    handleSubmit,
    register,
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pseudo: user?.pseudo || "",
    },
  })

  const onSubmit: SubmitHandler<FormSchema> = async (formData) => {
    try {
      if (!user?.id) return
      await updateUserDoc({ id: user.id, data: formData }).unwrap()

      reset()
      closeModal()
    } catch (error) {
      console.error("Error updating pseudo:", error)
    }
  }

  if (!user) return null

  return (
    <AlertDialog open>
      <AlertDialogContent data-testid="change-pseudo-modal" className="max-h-[80vh] overflow-y-auto" asChild>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Select a new pseudo</AlertDialogTitle>
            <AlertDialogDescription>
              Your pseudo is what other users see when they interact with you. Choose something that represents you well!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <Input
              {...register("pseudo", {
                required: true
              })}
            />
          </Field>
          <AlertDialogFooter>
            <Button variant="ghost" type="button" onClick={closeModal}>Skip for now</Button>
            <Button type="submit">Save {isLoading && <Loader /> }</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ChangePseudoModal
