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
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

export default function FounderSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [linkedinProfile, setLinkedinProfile] = useState("")
  const [error, setError] = useState("")
  const { user, signUp, loading } = useAuth()
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await signUp(
        email, 
        password, 
        fullName, 
        'founder',
        companyName,
        companyWebsite,
        linkedinProfile
      )
      router.push("/founder/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <Card className="mx-auto w-full">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Create Founder Account</CardTitle>
          <CardDescription>Join Veritas as a founder to showcase your vision.</CardDescription>
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
            
            {/* Company fields for founders */}
            <div className="grid gap-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                placeholder="Enter your company name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input 
                id="company-website" 
                type="url"
                placeholder="https://yourcompany.com" 
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin-profile">LinkedIn Profile URL</Label>
              <Input 
                id="linkedin-profile" 
                type="url"
                placeholder="https://linkedin.com/in/yourprofile" 
                value={linkedinProfile}
                onChange={(e) => setLinkedinProfile(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {isLoading ? "Creating Account..." : "Create Founder Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              Already have a founder account?{" "}
              <Link href="/founder/login" className="underline" prefetch={false}>
                Log in
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
    </div>
  )
}