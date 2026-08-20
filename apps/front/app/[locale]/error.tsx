"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) => {
  const t = useTranslations("common")

  useEffect(() => {
    console.error("Unhandled render error:", error)
  }, [error])

  return (
    <main className="min-h-full-height text-primary bg-background flex flex-col items-center justify-center gap-6 px-5">
      <p className="font-shapiro-wide text-2xl">{t("error")}</p>
      <div className="flex gap-4">
        <Button data-testid="error-retry" onClick={reset}>{t("retry")}</Button>
        <Button variant="marathon-outline" asChild>
          <Link href={PAGES.HOME}>{t("back")}</Link>
        </Button>
      </div>
    </main>
  )
}

export default ErrorPage
