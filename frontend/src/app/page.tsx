"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "../components/icons/logo"
import { ArrowRight, Smartphone, Download } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  // Debug logging
  console.log('🔍 Landing page rendered - user:', user)
  console.log('🔍 Landing page rendered - pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR')

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
          <div className="mb-8">
            <div className="inline-block rounded-full bg-white p-4 shadow-lg ring-2 ring-primary/20">
              <Logo className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>

          <h1 className="text-4xl font-headline font-bold tracking-tight text-gray-900 sm:text-5xl">Veritas</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Shape your narrative. Build your profile. Connect with the right people.
          </p>

          <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
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
                <CardTitle className="font-headline text-xl">For Administrators</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-6">
                <div>
                  <p className="text-muted-foreground">
                    Access the admin console to manage the platform and monitor operations.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    Comprehensive dashboard for platform management and analytics.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/admin/login">Access Admin Console</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Mobile App Download Section */}
          <div className="mt-16 w-full max-w-4xl">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 shadow-xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  {/* Icon Section */}
                  <div className="flex-shrink-0">
                    <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg ring-4 ring-purple-100">
                      <Smartphone className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Access Our Services Anytime
                    </h2>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      Download our mobile app to stay connected with founders, investors, and opportunities on the go.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl font-semibold px-8 py-6 text-base transition-all hover:scale-105"
                      asChild
                    >
                      <a 
                        href="https://appdistribution.firebase.dev/i/271a46c07956c054" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="h-5 w-5" />
                        Download Mobile App
                      </a>
                    </Button>
                  </div>
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
