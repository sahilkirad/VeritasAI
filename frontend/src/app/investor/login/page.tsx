"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"
import { AvengersLoader } from "@/components/ui/avengers-loader"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function InvestorLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { user, signIn, loading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'investor') {
        router.push("/dashboard")
      } else {
        router.push("/founder/dashboard")
      }
    }
  }, [user, loading, router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }
    
    if (!password.trim()) {
      setError("Please enter your password")
      setIsLoading(false)
      return
    }
    
    try {
      console.log('🔄 Attempting investor login for:', email)
      await signIn(email.trim(), password, 'investor')
      console.log('✅ Investor login successful, redirecting to dashboard')
      router.push("/dashboard")
    } catch (error: any) {
      console.error('❌ Investor login error:', error)
      setError(error.message || "Failed to sign in. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }


  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <AvengersLoader size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
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
          <CardTitle className="text-2xl font-headline">Investor Login</CardTitle>
          <CardDescription>Sign in to your Investor dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <div className="w-4 h-4 text-red-500 mt-0.5">⚠</div>
                <div>{error}</div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || loading}
                className="transition-all duration-200"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline hover:text-primary" prefetch={false}>
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || loading}
                className="transition-all duration-200"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full transition-all duration-200" 
              disabled={isLoading || loading}
            >
              {isLoading ? (
                <>
                  <AvengersLoader size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              Don't have an investor account?{" "}
              <Link href="/investor/signup" className="underline" prefetch={false}>
                Sign up
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
