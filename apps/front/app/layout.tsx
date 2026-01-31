/* eslint-disable react-refresh/only-export-components */
import { type Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"
import { ModalProvider } from "@/components/modals"
import StoreProvider from "@/components/providers/redux-provider"
import { Toaster } from "@/components/ui/sonner"
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
  title: "Geo gamers",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <StoreProvider>
            <Toaster />
            <Suspense>
              <ModalProvider />
            </Suspense>
            {children}
          </StoreProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
