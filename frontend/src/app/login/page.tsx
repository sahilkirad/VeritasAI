"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"


export default function LoginPage() {
  const router = useRouter()

  // Redirect to main page for role selection
  useEffect(() => {
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
