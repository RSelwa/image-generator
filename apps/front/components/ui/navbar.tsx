"use client"

import Link from "next/link"
import { type ComponentProps } from "react"
import { NewLogoIcon } from "@/components/icons"
import { Logo } from "@/components/icons/logo"
import { Button } from "@/components/ui/button"
import { NavUser } from "@/components/ui/nav-user"
import { PAGES } from "@/constants/pages"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

export const LogoHeader = ({ href, className }: ComponentProps<"a">) => (
  <Link href={href || PAGES.HOME} className={cn("flex items-center gap-4", className)}>
    <NewLogoIcon className="size-15 bg-primary p-4 text-primary-foreground" />
    <Logo className="h-10 hidden lg:block text-primary" />
  </Link>
)

const Navbar = () => {
  const user = useAppSelector(selectUser)

  return (
    <nav className="flex justify-between pr-4 h-15">
      <LogoHeader />
      {user && !user.isAnonymous && (
        <article className="flex items-center gap-3">
          <NavUser />
        </article>
      )}
      {(!user || user.isAnonymous) && (
        <article className="flex items-center gap-3">
          <Button variant="marathon-outline" asChild>
            <Link data-testid="login-button" href={PAGES.LOGIN}>Login</Link>
          </Button>
          <Button variant="marathon" asChild>
            <Link data-testid="signup-button" href={PAGES.SIGNUP}>Join</Link>
          </Button>
        </article>
      )}
    </nav>
  )
}

export default Navbar
