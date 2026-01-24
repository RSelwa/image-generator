import { AdminGuard } from "@/components/guards/admin-guard"
import type { ReactNode } from "react"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminGuard>{children}</AdminGuard>
}
