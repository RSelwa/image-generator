import { type Metadata } from "next"
import Link from "next/link"
import HomeFooter from "@/components/home/home-footer"
import { Button } from "@/components/ui/button"
import { LogoHeader } from "@/components/ui/navbar"
import { PAGES } from "@/constants/pages"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The geo-guessr for games",
}

export default function NotFound() {
  return (
    <main className="min-h-screen -translate-y-header-height">
      <nav className="flex h-header-height w-full">
        <LogoHeader />
      </nav>
      <section className="uppercase lg:text-lg text-xs font-mono flex items-center justify-center h-full-height">
        <article className="space-y-2">
          <Link href={PAGES.HOME}>
            <Button className="mb-8">Go home</Button>
          </Link>
          <p className="mb-8">404 - YOU SHOULDN'T BE H~~~~%^&*+:"?~~</p>
          <p>
            //////////////PLEASE//////////////////
          </p>
          <p>////////////////TRY///////////////////</p>
          <p>////////////////AGAIN/////////////////</p>
        </article>
      </section>
      <HomeFooter />
    </main>
  )
}
