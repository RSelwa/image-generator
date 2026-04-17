"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AVATARS_KEYS } from "@repo/common"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { AuthGuard } from "@/components/guards/auth-guard"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useUpdateUserDocMutation } from "@/redux/api/user"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getAvatarKeyFromUrl, getAvatarUrl } from "@/utils/file"

const formSchema = z.object({
  pseudo: z.string().min(3, "Pseudo must be at least 3 characters").max(30, "Pseudo must be at most 30 characters"),
  avatar: z.enum(AVATARS_KEYS).nullish(),
  newsletter: z.boolean(),
})

type FormSchema = z.infer<typeof formSchema>

const AccountForm = () => {
  const t = useTranslations("account")
  const tAuth = useTranslations("auth")
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
      newsletter: user?.newsletter || false,
    },
  })

  useEffect(() => {
    if (!user) return

    reset({
      pseudo: user.pseudo || "",
      avatar: getAvatarKeyFromUrl(user.avatar || ""),
      newsletter: user.newsletter || false,
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
          newsletter: formData.newsletter,
        },
      }).unwrap()

      toast.success(t("profileUpdated"))
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(t("profileUpdateFailed"))
    }
  }

  if (!user) return null

  const watchAvatar = watch("avatar")
  const watchNewsletter = watch("newsletter")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle className="font-interference">{t("profilePicture")}</CardTitle>
            <CardDescription className="font-mono">{t("profilePictureDescription")}</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger>
              <UserAvatar avatar={watchAvatar || user.avatar} name={user.pseudo} donorTier={user.donorTier} className="size-20" fallbackClassName="rounded-lg text-2xl" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto grid grid-cols-4 gap-4">
              {Object.values(AVATARS_KEYS).map((avatarKey) => (
                <button
                  key={avatarKey}
                  className="size-16 lg:size-32 hover:bg-primary! cursor-pointer bg-cover bg-white"
                  // style={{ backgroundImage: `url(${AVATARS_BACKGROUND_URLS.PERIMETER})` }}
                  onClick={() =>
                    setValue("avatar", avatarKey, { shouldDirty: true })}
                >
                  <Image src={getAvatarUrl(avatarKey)} alt={`Avatar of ${avatarKey}`} width={370} height={370} />
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="pseudo">{t("pseudo")}</FieldLabel>
            <FieldDescription>{t("pseudoDescription")}</FieldDescription>
            <Input
              id="pseudo"
              placeholder={t("pseudo")}
              {...register("pseudo")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">{tAuth("email")}</FieldLabel>
            <FieldDescription>{t("emailDescription")}</FieldDescription>
            <Input
              id="email"
              value={user.email}
              disabled
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="newsletter">{t("newsletter")}</FieldLabel>
            <FieldDescription>{t("newsletterDescription")}</FieldDescription>
            <Switch checked={watchNewsletter} onCheckedChange={(checked) => setValue("newsletter", checked, { shouldDirty: true })} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant={isDirty ? "marathon" : "marathon-outline"} type="submit" disabled={isLoading || !isDirty}>
          {isLoading && <Loader className="size-4" />}
          {t("saveChanges")}
        </Button>
      </div>
    </form>
  )
}

const AccountPage = () => {
  const t = useTranslations("account")

  return (
    <AuthGuard>
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <AccountForm />
      </main>
    </AuthGuard>
  )
}

export default AccountPage
