import { APP_BASE_URL } from "@repo/common"
import { Analytics } from "@vercel/analytics/next"
import { type Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { Geist } from "next/font/google"
import localFont from "next/font/local"
import { notFound } from "next/navigation"
import Script from "next/script"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"
import { ModalProvider } from "@/components/modals"
import StoreProvider from "@/components/providers/redux-provider"
import { Toaster } from "@/components/ui/sonner"
import { APP_NAME } from "@/constants/mapping"
import { routing } from "@/i18n/routing"
import "@photo-sphere-viewer/core/index.css"
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const fraktion = localFont({
  src: "../../public/fonts/Fraktion.woff2",
  variable: "--font-fraktion",
})

const fraktionMono = localFont({
  src: "../../public/fonts/Fraktion-mono.woff2",
  variable: "--font-fraktion-mono",
})

const interference = localFont({
  src: "../../public/fonts/Interference.otf",
  variable: "--font-interference",
})

const shapiro = localFont({
  src: "../../public/fonts/Shapiro.otf",
  variable: "--font-shapiro",
})

const shapiroWide = localFont({
  src: "../../public/fonts/Shapiro-wide.woff2",
  variable: "--font-shapiro-wide",
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  verification: {
    google: "zJZ1-ScEmmCJFO6rZ5SVawDF1gnNNePjN7uoB9YgFSg"
  },
  title: APP_NAME,
  description: "Guess iconic video game locations solo or with friends. 300+ scenes, real-time multiplayer, free to play.",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body
        data-marathon
        className={`${geistSans.variable} ${fraktion.variable} ${shapiroWide.variable} ${fraktionMono.variable} ${interference.variable} ${shapiro.variable} antialiased dark pt-header-height!`}
      >
        <NextIntlClientProvider messages={messages}>
          <Suspense>
            <NuqsAdapter>
              <StoreProvider>
                <Suspense>
                  <Toaster />
                  <ModalProvider />
                  {children}
                  <Analytics />
                </Suspense>
              </StoreProvider>
            </NuqsAdapter>
          </Suspense>
          <Script src="https://cloud.umami.is/script.js" data-website-id="c5427705-3677-4189-8fbb-73c4e7510760" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
