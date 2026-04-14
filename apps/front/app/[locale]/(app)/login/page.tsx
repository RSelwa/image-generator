import { APP_BASE_URL } from "@repo/common"
import { type Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  return {
    title: "Login — Geo Gamer",
    description: "Sign in to your Geo Gamer account to track your daily challenge streak, save your scores, and challenge friends.",
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}/login`,
      languages: {
        en: `${APP_BASE_URL}/en/login`,
        fr: `${APP_BASE_URL}/fr/login`,
        "x-default": `${APP_BASE_URL}/en/login`,
      },
    },
  }
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex h-full-height flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
