"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"
import { AvengersLoader } from "@/components/ui/avengers-loader"
import { useState } from "react"

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M20.94 11.04c0-.82-.07-1.59-.2-2.34H12v4.51h5.02c-.21.82-.71 1.74-1.42 2.38v2.98h3.81c2.23-2.05 3.54-5.17 3.54-8.53z"
        fill="#4285F4"
      />
      <path
        d="M12 21c3.42 0 6.28-1.13 8.37-3.05l-3.81-2.98c-1.13.76-2.58 1.21-4.56 1.21-3.49 0-6.45-2.35-7.5-5.52H.69v3.08C2.79 18.23 7.03 21 12 21z"
        fill="#34A853"
      />
      <path d="M4.5 12.55a7.53 7.53 0 0 1 0-4.1V5.37H.69a12.02 12.02 0 0 0 0 10.26l3.81-3.08z" fill="#FBBC05" />
      <path
        d="M12 4.8c1.86 0 3.55.64 4.87 1.89l3.39-3.39C18.28 1.13 15.42 0 12 0 7.03 0 2.79 2.77.69 6.86l3.81 3.08c1.05-3.17 4.01-5.52 7.5-5.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function InvestorLoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = () => {
    setIsLoading(true)
    // Simulate loading for demo
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 2000)
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
          <CardDescription>Sign in to your AI Analyst dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="rohan@vcfirm.com" required defaultValue="rohan@vcfirm.com" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button onClick={handleSignIn} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <AvengersLoader size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an investor account?{" "}
            <Link href="/signup" className="underline" prefetch={false}>
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
