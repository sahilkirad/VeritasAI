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

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [canCreateAdmin, setCanCreateAdmin] = useState(false)
  const { user, signIn, loading } = useAuth()
  const router = useRouter()

  // Check if first admin can be created
  useEffect(() => {
    const checkAdminCreation = async () => {
      try {
        const { databaseAuth } = await import('@/lib/database-auth')
        const canCreate = await databaseAuth.canCreateAdmin()
        setCanCreateAdmin(canCreate)
      } catch (error) {
        console.error('Error checking admin creation:', error)
      }
    }
    checkAdminCreation()
  }, [])

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 Admin login attempt:', { email, password: '***' })
    setIsLoading(true)
    setError("")
    
    try {
      console.log('🔄 Calling signIn function...')
      await signIn(email, password, 'admin')
      console.log('✅ SignIn successful, redirecting...')
      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error('❌ Admin login error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Provide more helpful error messages
      if (error.message?.includes('No account found')) {
        setError("No admin account found with this email. Please sign up first or check your email address.")
      } else if (error.message?.includes('Invalid email or password')) {
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (error.message?.includes('registered as')) {
        setError("This email is registered as a different user type. Please use the correct login page.")
      } else {
        setError(error.message || "Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl font-headline">Admin Console</CardTitle>
          <CardDescription>Sign in to your Admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                  Forgot password?
                </Link>
              </div>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            {canCreateAdmin && (
              <div>
                <Link href="/admin/signup" className="underline" prefetch={false}>
                  Create First Admin Account
                </Link>
              </div>
            )}
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
