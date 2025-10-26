import { ReactNode } from "react"
import { AdminDashboardClient } from "./AdminDashboardClient"

interface AdminDashboardLayoutProps {
  children: ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <AdminDashboardClient>
      {children}
    </AdminDashboardClient>
  )
}