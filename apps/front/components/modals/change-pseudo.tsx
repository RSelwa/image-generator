import { zodResolver } from "@hookform/resolvers/zod"
import { AVATARS_KEYS } from "@repo/common"
import Image from "next/image"
import * as React from "react"
import { type SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "@/components/icons/loader"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AVATARS_BACKGROUND_URLS, MODAL_KEYS } from "@/constants/mapping"
import { useIsMobile } from "@/hooks/use-mobile"
import { useModal } from "@/hooks/use-modal"
import { useUpdateUserDocMutation } from "@/redux/api/user"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"
import { getAvatarKeyFromUrl, getAvatarUrl } from "@/utils/file"

const key = MODAL_KEYS.CHANGE_PSEUDO

const formSchema = z.object({
  pseudo: z.string().min(3, "Pseudo must be at least 3 characters").max(30, "Pseudo must be at most 30 characters"),
  avatar: z.enum(AVATARS_KEYS).nullish(),
})
type FormSchema = z.infer<typeof formSchema>

const ChangePseudoModal = () => {
  const { closeModal } = useModal(key)
  const isMobile = useIsMobile()

  const user = useAppSelector(selectUser)

  const [updateUserDoc, { isLoading }] = useUpdateUserDocMutation()

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pseudo: user?.pseudo || "",
      avatar: getAvatarKeyFromUrl(user?.avatar || ""),
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

  const watchAvatar = watch("avatar")
  const avatar = watchAvatar ? getAvatarUrl(watchAvatar) : user.avatar

  return (
    <AlertDialog open>
      <AlertDialogContent data-testid="change-pseudo-modal" className="max-h-[80vh] overflow-y-auto" asChild>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Personalize your account</AlertDialogTitle>
            <AlertDialogDescription>
              Your pseudo and your avatar is what other users see when they interact with you. Choose something that represents you well!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="w-full flex items-center gap-2">
            <Popover>
              <PopoverTrigger>
                <Avatar className="size-20">
                  <AvatarImage src={avatar || ""} alt={user.pseudo} />
                  <AvatarFallback className="rounded-lg text-2xl">
                    {firstLetter(user.pseudo)}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align={isMobile ? "start" : "center"} className="w-auto grid grid-cols-4 gap-4">
                {Object.values(AVATARS_KEYS).map((avatarKey) => (
                  <button
                    key={avatarKey}
                    className="size-16 lg:size-24 hover:bg-primary! cursor-pointer bg-cover"
                    style={{ backgroundImage: `url(${AVATARS_BACKGROUND_URLS.PERIMETER})` }}
                    onClick={() =>
                      setValue("avatar", avatarKey, { shouldDirty: true })}
                  >
                    <Image src={getAvatarUrl(avatarKey)} alt={`Avatar of ${avatarKey}`} width={370} height={370} />
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Field>
              <FieldLabel htmlFor="pseudo">Pseudo</FieldLabel>
              <Input
                {...register("pseudo", {
                  required: true
                })}
              />
            </Field>
          </div>

          <AlertDialogFooter>
            <Button variant="ghost" type="button" onClick={closeModal}>Skip for now</Button>
            <Button type="submit" variant={isDirty ? "marathon" : "marathon-outline"}>Save {isLoading && <Loader />}</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ChangePseudoModal
