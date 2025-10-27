"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"
import { AvengersLoader } from "@/components/ui/avengers-loader"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [canCreateAdmin, setCanCreateAdmin] = useState(false)
  const { user, signUp, loading } = useAuth()
  const router = useRouter()

  // Check if first admin can be created
  useEffect(() => {
    const checkAdminCreation = async () => {
      try {
        const { databaseAuth } = await import('@/lib/database-auth')
        const canCreate = await databaseAuth.canCreateAdmin()
        setCanCreateAdmin(canCreate)
        
        // If admin already exists, redirect to login
        if (!canCreate) {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error('Error checking admin creation:', error)
        setError("Error checking admin status. Please try again.")
      }
    }
    checkAdminCreation()
  }, [router])

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push("/admin/dashboard")
      } else if (user.role === 'founder') {
        router.push("/founder/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await signUp(email, password, fullName, 'admin')
      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error('Admin signup error:', error)
      setError(error.message || "Failed to create admin account")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading if checking admin creation
  if (!canCreateAdmin && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <AvengersLoader size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Checking admin status...</p>
        </div>
      </div>
    )
  }

  // Show error if admin already exists
  if (!canCreateAdmin && error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Admin Registration Closed</CardTitle>
            <CardDescription>Admin registration is not available.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              An admin account already exists. Please contact the existing admin for access.
            </p>
            <Link href="/admin/login">
              <Button className="w-full">Go to Admin Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold">Veritas</span>
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create Admin Account</CardTitle>
          <CardDescription>Set up the first admin account for Veritas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="Enter your full name" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {isLoading ? (
                <>
                  <AvengersLoader size="sm" className="mr-2" />
                  Creating Admin Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Link href="/admin/login" className="underline" prefetch={false}>
                Already have an admin account? Sign in
              </Link>
            </div>
            <div>
              <Link href="/" className="text-primary hover:underline" prefetch={false}>
                ← Back to Veritas Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
