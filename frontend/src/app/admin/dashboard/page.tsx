"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect to overview page
    router.push('/admin/dashboard/overview')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Redirecting to Admin Dashboard...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
