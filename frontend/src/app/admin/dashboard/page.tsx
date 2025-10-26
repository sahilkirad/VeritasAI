"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't do anything while AuthContext is still loading
    if (loading) {
      return
    }

    // Check localStorage directly for admin session
    const session = typeof window !== 'undefined' ? localStorage.getItem('veritas_session') : null
    
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        if (sessionData.role === 'admin') {
          router.push('/admin/dashboard/overview')
          return
        }
      } catch (e) {
        // Invalid session
      }
    }
    
    // Check if user is admin (fallback)
    if (!user || user.role !== 'admin') {
      router.push('/admin')
      return
    }

    // Redirect to overview page
    router.push('/admin/dashboard/overview')
  }, [user, loading, router])

  // Show loading while AuthContext is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we verify your session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Admin Dashboard...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
