"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { ColoredGoogleIcon } from "@/components/icons"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS, QUERY_PARAMS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import {
  useCreateUserAuthMutation,
  useLoginWithGoogleMutation,
} from "@/redux/api/auth"
import { selectAuthUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})
export type SignupSchema = z.infer<typeof signupSchema>

export const SignupForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const searchParams = useSearchParams()
  const redirect = searchParams.get(QUERY_PARAMS.REDIRECT)

  const router = useRouter()
  const authUser = useAppSelector(selectAuthUser)

  const [createAuthUser, { isLoading }] = useCreateUserAuthMutation()
  const [loginWithGoogle, { isLoading: isLoadingGoogle }] =
    useLoginWithGoogleMutation()

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (!authUser || authUser?.isAnonymous) return

    const searchParams = new URLSearchParams(MODAL_KEYS.CHANGE_PSEUDO)
    const redirectUrl = redirect ? new URL(redirect, window.location.origin) : new URL(`${PAGES.HOME}?${searchParams}`, window.location.origin)

    router.push(redirectUrl.href)
  }, [authUser?.isAnonymous, redirect, router])

  const onSubmit: SubmitHandler<SignupSchema> = async (data) => {
    const { error } = await createAuthUser(data)

    if (error) {
      console.error("Error creating user:", error)

      return
    }

    reset()
  }

  const onLoginWithGoogle = async () => {
    const { error } = await loginWithGoogle()

    if (error) return

    reset()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-primary-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", { required: true })}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", { required: true })}
                  />
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">
                  Create Account {isLoading && <Loader />}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onLoginWithGoogle}
                >
                  <ColoredGoogleIcon />
                  <span className="sr-only">Sign up with Google</span>

                  {isLoadingGoogle && <Loader />}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href={redirect ? `${PAGES.LOGIN}?${QUERY_PARAMS.REDIRECT}=${encodeURIComponent(redirect)}` : PAGES.LOGIN}>Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/signup.png"
              alt="Singup"
              className="absolute inset-0 h-full w-full object-cover dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our
        {" "}
        <Link href={PAGES.TERMS}>Terms of Service</Link>
        {" "}
        and
        {" "}
        <Link href={PAGES.PRIVACY}>Privacy Policy</Link>
        .
      </FieldDescription>
    </div>
  )
}
