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
    setIsLoading(true)
    setError("")
    
    try {
      await signIn(email, password, 'founder')
      router.push("/founder/dashboard")
    } catch (error: any) {
      console.error('Founder login error:', error)
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
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold">Veritas</span>
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Founder Login</CardTitle>
          <CardDescription>Sign in to your Founder dashboard.</CardDescription>
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
            
            {/* Test Account Button for Development */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
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
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              Don't have a founder account?{" "}
              <Link href="/founder/signup" className="underline" prefetch={false}>
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