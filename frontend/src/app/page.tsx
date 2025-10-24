"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "../components/icons/logo"
import { ArrowRight, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      console.log('✅ Logged out successfully')
      // Refresh the page to clear any cached state
      window.location.reload()
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Still refresh the page
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef5ff]">
      {user && (
        <div className="bg-blue-100 p-2 text-center text-sm">
          <span>Logged in as: {String(user.email || 'Unknown')} ({String(user.role || 'Unknown')})</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="ml-2"
          >
            Logout
          </Button>
        </div>
      )}
      <main className="flex-1">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-16 text-center md:py-24">
          <div className="mb-6">
            <div className="inline-block rounded-full bg-primary p-3">
              <Logo className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl font-headline font-bold tracking-tight text-gray-900 sm:text-5xl">Veritas</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Shape your narrative. Build your profile. Connect with the right people.
          </p>

          <div className="mt-12 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="font-headline text-xl">For Founders</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-muted-foreground">
                    Build a comprehensive profile to showcase your vision and qualifications.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    Our detailed onboarding process helps you articulate your story, preparing you for our
                    founder-problem fit analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/founder/signup">Start Building Your Profile</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/founder/login">
                      <ArrowRight className="mr-2 h-4 w-4" /> Log In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="font-headline text-xl">For Investors</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-6">
                <div>
                  <p className="text-muted-foreground">
                    Create a streamlined profile to connect with promising founders.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    A quick and easy setup to get you started on discovering the next big thing.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/investor/signup">Create Your Investor Profile</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/investor/login">
                      <ArrowRight className="mr-2 h-4 w-4" /> Log In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Admin Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-6">
                <div>
                  <p className="text-muted-foreground">
                    Access the comprehensive admin dashboard for platform management.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    Monitor deals, review AI-generated memos, and manage the investment pipeline.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href="/admin">Access Admin Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/admin">
                      <ArrowRight className="mr-2 h-4 w-4" /> Admin Login
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Veritas. All rights reserved.
      </footer>
    </div>
  )
}
