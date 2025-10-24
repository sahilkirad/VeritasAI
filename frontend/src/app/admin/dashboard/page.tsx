"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      router.push('/admin')
      return
    }

    // Redirect to overview page
    router.push('/admin/dashboard/overview')
  }, [user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Admin Dashboard...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
