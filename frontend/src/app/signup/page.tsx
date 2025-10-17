"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main page to choose role
    router.push("/")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <p className="text-muted-foreground">Please choose your role on the main page.</p>
      </div>
    </div>
  )
}
