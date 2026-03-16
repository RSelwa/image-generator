"use client"

import { useRouter } from "@/i18n/routing"
import { type ReactNode, useEffect } from "react"
import { SESSION_STATUS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { selectSessionStatus, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type AuthGuardProps = {
  children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter()
  const status = useAppSelector(selectSessionStatus)
  const user = useAppSelector(selectUser)

  const isLoading = status === SESSION_STATUS.LOADING

  useEffect(() => {
    if (isLoading) return

    if (status === SESSION_STATUS.SUCCESS && (!user || user.isAnonymous))
      router.replace(PAGES.LOGIN)
  }, [status, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-primary-foreground">
          {status}
          ...
        </div>
      </div>
    )
  }

  if (status !== SESSION_STATUS.SUCCESS || !user || user.isAnonymous) {
    return null
  }

  return <>{children}</>
}
