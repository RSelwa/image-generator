"use client"

import { LogoIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { NavUser } from "@/components/ui/nav-user"
import { PAGES } from "@/constants/pages"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import Link from "next/link"

const Navbar = () => {
  const user = useAppSelector(selectUser)

  return (
    <nav className="flex justify-between mb-2 p-4">
      <section className="flex items-center gap-2">
        <Link href={PAGES.HOME} className="flex items-center space-x-2">
          <span className="text-2xl">
            <LogoIcon />
          </span>
          <span className="hidden font-bold text-xl sm:inline-block">
            geo-guesser.io
          </span>
        </Link>
      </section>
      {user && <NavUser />}
      {!user && (
        <article className="flex items-center gap-3">
          <Button variant="outline">
            <Link href={PAGES.LOGIN}>Login</Link>
          </Button>
          <Button variant="default">
            <Link href={PAGES.SIGNUP}>Join</Link>
          </Button>
        </article>
      )}
    </nav>
  )
}

export default Navbar
