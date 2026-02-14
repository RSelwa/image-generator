import { type Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"
import { HelperMenu } from "@/components/helper"
import { ModalProvider } from "@/components/modals"
import StoreProvider from "@/components/providers/redux-provider"
import { Toaster } from "@/components/ui/sonner"
import { APP_NAME } from "@/constants/mapping"
import "@photo-sphere-viewer/core/index.css"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: APP_NAME,
  description: "The geo-guessr for games",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        data-marathon
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Suspense>
          <NuqsAdapter>
            <StoreProvider>
              <Suspense>
                <Toaster />
                <ModalProvider />
                {children}
                <HelperMenu />
              </Suspense>
            </StoreProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  )
}
