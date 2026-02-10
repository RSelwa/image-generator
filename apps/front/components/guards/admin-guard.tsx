"use client"

import { useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"
import { SESSION_STATUS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import {
  selectHasRightToDashBoard,
  selectSessionStatus,
} from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type AdminGuardProps = {
  children: ReactNode
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter()
  const status = useAppSelector(selectSessionStatus)

  const hasRights = useAppSelector(selectHasRightToDashBoard)

  const isLoading = status === SESSION_STATUS.LOADING

  useEffect(() => {
    if (isLoading) return

    if (status === SESSION_STATUS.SUCCESS && !hasRights)
      router.replace(PAGES.HOME)
  }, [status, hasRights, isLoading, router])

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

  if (status !== SESSION_STATUS.SUCCESS || !hasRights) {
    return null
  }

  return <>{children}</>
}
