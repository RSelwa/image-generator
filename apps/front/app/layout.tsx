import { type Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
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

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// })

const font1 = localFont({
  src: "../public/fonts/Fraktion.woff2",
  variable: "--font-fraktion",
})

const front2 = localFont({
  src: "../public/fonts/Fraktion-mono.woff2",
  variable: "--font-fraktion-mono",
})

const front3 = localFont({
  src: "../public/fonts/Interference.otf",
  variable: "--font-interference",
})

const front4 = localFont({
  src: "../public/fonts/Shapiro.otf",
  variable: "--font-shapiro",
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
        className={`${geistSans.variable} ${font1.variable} ${front2.variable} ${front3.variable} ${front4.variable} antialiased dark`}
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
