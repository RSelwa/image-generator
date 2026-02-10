"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { GoogleIcon } from "@/components/icons"
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
import { QUERY_PARAMS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import {
  useLoginMutation,
  useLoginWithGoogleMutation,
  useSendPasswordResetEmailMutation,
} from "@/redux/api/auth"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})
type LoginSchema = z.infer<typeof loginSchema>

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const searchParams = useSearchParams()
  const redirect = searchParams.get(QUERY_PARAMS.REDIRECT)
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const pendingRedirect = useRef(false)

  const [sendPasswordResetEmail] = useSendPasswordResetEmailMutation()
  const [login, { isLoading }] = useLoginMutation()
  const [loginWithGoogle, { isLoading: isLoadingGoogle }] =
    useLoginWithGoogleMutation()

  const { register, getValues, handleSubmit, reset } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (!pendingRedirect.current || !user) return

    pendingRedirect.current = false
    router.push(redirect || PAGES.HOME)
  }, [user, redirect, router])

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    const { error } = await login(data)
    if (error) return

    reset()
    pendingRedirect.current = true
  }

  const onLoginWithGoogle = async () => {
    const { error } = await loginWithGoogle()

    if (error) return

    reset()
    pendingRedirect.current = true
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-primary-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email", { required: true })}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    onClick={() => sendPasswordResetEmail(getValues("email"))}
                    type="button"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: true })}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  Login {isLoading && <Loader />}
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
                  <GoogleIcon />
                  <span className="sr-only">Sign up with Google</span>
                  {isLoadingGoogle && <Loader />}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?
                {" "}
                <Link href={redirect ? `${PAGES.SIGNUP}?${QUERY_PARAMS.REDIRECT}=${encodeURIComponent(redirect)}` : PAGES.SIGNUP}>Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/signup.png"
              alt="Login"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
