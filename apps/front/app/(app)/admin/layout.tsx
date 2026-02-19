"use client"

import { type ReactNode } from "react"
import { AdminGuard } from "@/components/guards/admin-guard"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  )
}
