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

export default function FounderLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { user, signIn, signUp, loading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'founder') {
        router.push("/founder/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 Founder login attempt:', { email, password: '***' })
    setIsLoading(true)
    setError("")
    
    try {
      console.log('🔄 Calling signIn function...')
      await signIn(email, password, 'founder')
      console.log('✅ SignIn successful, redirecting...')
      router.push("/founder/dashboard")
    } catch (error: any) {
      console.error('❌ Founder login error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Provide more helpful error messages
      if (error.message?.includes('No account found')) {
        setError("No founder account found with this email. Please sign up first or check your email address.")
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

  // Add test account functionality for development
  const handleTestAccount = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      // Create a test founder account if it doesn't exist
      const testEmail = "test@founder.com"
      const testPassword = "test123"
      const testName = "Test Founder"
      
      // Try to sign in first
      try {
        await signIn(testEmail, testPassword, 'founder')
        router.push("/founder/dashboard")
        return
      } catch (signInError) {
        // If sign in fails, try to create the account
        console.log('Test account not found, creating...')
        await signUp(testEmail, testPassword, testName, 'founder', 'Test Company', 'https://testcompany.com', 'https://linkedin.com/in/testfounder')
        router.push("/founder/dashboard")
      }
    } catch (error: any) {
      console.error('Test account creation error:', error)
      setError("Failed to create test account. Please sign up manually.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Professional Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground group hover:opacity-90 transition-all duration-200">
              <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 ring-2 ring-primary/20 shadow-sm group-hover:shadow-md group-hover:ring-primary/30 transition-all duration-200">
                <Logo className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-xl font-bold leading-tight">Veritas</span>
                <span className="text-xs text-muted-foreground font-medium">AI Investment Platform</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <Card className="mx-auto w-full max-w-sm mt-24 shadow-xl border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-3xl font-headline font-bold">Founder Login</CardTitle>
          <CardDescription className="text-base">Sign in to access your Founder dashboard and manage your startup profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading || loading}
              />
            </div>
            <div className="grid gap-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline transition-colors" prefetch={false}>
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading || loading}
              />
            </div>
            <Button type="submit" className="w-full h-11 mt-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200" disabled={isLoading || loading}>
              {isLoading ? (
                <>
                  <AvengersLoader size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            {/* Test Account Button for Development */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 mt-1 border-2 font-medium transition-all duration-200 hover:bg-accent/50" 
              onClick={handleTestAccount}
              disabled={isLoading || loading}
            >
              {isLoading ? (
                <>
                  <AvengersLoader size="sm" className="mr-2" />
                  Creating Test Account...
                </>
              ) : (
                "Use Test Account (Development)"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <div>
              Don't have a founder account?{" "}
              <Link href="/founder/signup" className="underline hover:text-primary transition-colors" prefetch={false}>
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}