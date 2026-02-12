"use client"

import Link from "next/link"
import { type ComponentProps } from "react"
import { LogoIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { NavUser } from "@/components/ui/nav-user"
import { PAGES } from "@/constants/pages"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

export const LogoHeader = ({ href, className }: ComponentProps<"a">) => (
  <section className={cn("flex items-center", className)}>
    <Link href={href || PAGES.HOME} className="flex items-center space-x-2">
      <span className="text-2xl">
        <LogoIcon />
      </span>
      <span className="hidden font-bold text-xl sm:inline-block">
        geo-guesser.io
      </span>
    </Link>
  </section>
)

const Navbar = () => {
  const user = useAppSelector(selectUser)

  return (
    <nav className="flex justify-between mb-2 p-4">
      <LogoHeader />
      {user && !user.isAnonymous && (
        <article className="flex items-center gap-3">
          <NavUser />
        </article>
      )}
      {(!user || user.isAnonymous) && (
        <article className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={PAGES.LOGIN}>Login</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href={PAGES.SIGNUP}>Join</Link>
          </Button>
        </article>
      )}
    </nav>
  )
}

export default Navbar
