"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { AuthGuard } from "@/components/guards/auth-guard"
import Loader from "@/components/icons/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUpdateUserDocMutation } from "@/redux/api/user"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter } from "@/utils"
import { AVATARS_KEYS } from "@repo/common"
import { AVATARS_BACKGROUND_URLS, AVATARS_URLS } from "@/constants/mapping"
import { getAvatarKeyFromUrl, getAvatarUrl } from "@/utils/file"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"

const formSchema = z.object({
  pseudo: z.string().min(3, "Pseudo must be at least 3 characters").max(30, "Pseudo must be at most 30 characters"),
  avatar: z.enum(AVATARS_KEYS).nullish(),
})

type FormSchema = z.infer<typeof formSchema>

const AccountForm = () => {
  const user = useAppSelector(selectUser)
  const [updateUserDoc, { isLoading }] = useUpdateUserDocMutation()


  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pseudo: user?.pseudo || "",
      avatar: getAvatarKeyFromUrl(user?.avatar || ""),
    },
  })

  useEffect(() => {
    if (!user) return

    reset({
      pseudo: user.pseudo || "",
      avatar: getAvatarKeyFromUrl(user.avatar || ""),
    })

  }, [user, reset])


  const onSubmit: SubmitHandler<FormSchema> = async (formData) => {
    try {
      if (!user?.id) return


      await updateUserDoc({
        id: user.id,
        data: {
          pseudo: formData.pseudo,
          avatar: formData.avatar,
        },
      }).unwrap()

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  if (!user) return null

  const watchAvatar = watch("avatar")
  const avatar = watchAvatar ? getAvatarUrl(watchAvatar) : user.avatar

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Your avatar visible to other players</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger>
              <Avatar className="size-20">
                <AvatarImage src={avatar || ""} alt={user.pseudo} />
                <AvatarFallback className="rounded-lg text-2xl">
                  {firstLetter(user.pseudo)}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto grid grid-cols-4 gap-4">
              {Object.values(AVATARS_KEYS).map((avatarKey) => (
                <button key={avatarKey} className="size-32 hover:bg-primary cursor-pointer" onClick={() =>
                  setValue("avatar", avatarKey)
                }>

                  <Image src={getAvatarUrl(avatarKey)} alt={`Avatar of ${avatarKey}`} width={370} height={370} className={`bg-[url(${AVATARS_BACKGROUND_URLS.PERIMETER})] bg-cover`} />
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="pseudo">Pseudo</FieldLabel>
            <FieldDescription>This is the name other players will see</FieldDescription>
            <Input
              id="pseudo"
              placeholder="Your pseudo"
              {...register("pseudo")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldDescription>Your email address cannot be changed here</FieldDescription>
            <Input
              id="email"
              value={user.email}
              disabled
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader className="size-4" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}

const AccountPage = () => (
  <AuthGuard>
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information</p>
      </div>
      <AccountForm />
    </main>
  </AuthGuard>
)

export default AccountPage
