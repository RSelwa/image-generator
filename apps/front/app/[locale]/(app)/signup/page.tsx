import { APP_BASE_URL } from "@repo/common"
import { type Metadata } from "next"
import { SignupForm } from "@/components/signup-form"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  return {
    title: "Sign Up — Geo Gamer",
    description: "Create your free Geo Gamer account. Track your daily challenge streak, compete on the global leaderboard, and challenge up to 7 friends.",
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}/signup`,
      languages: {
        en: `${APP_BASE_URL}/en/signup`,
        fr: `${APP_BASE_URL}/fr/signup`,
        "x-default": `${APP_BASE_URL}/en/signup`,
      },
    },
  }
}

export default function SignupPage() {
  return (
    <div className="bg-muted flex h-full-height flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
