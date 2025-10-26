"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"
import { ArrowRight, Mail, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already logged in as admin (using useEffect to avoid render-time navigation)
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin/dashboard')
    }
  }, [user, router])

  const handlePasswordlessLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      if (email === "admin@veritas.com") {
        // Create admin user profile
        const adminUser = {
          uid: 'admin-001',
          email: 'admin@veritas.com',
          displayName: 'Admin User',
          role: 'admin' as const,
          password: '', // No password for passwordless
          createdAt: new Date().toISOString(),
          isAuthenticated: true
        }
        
        // Store session in localStorage with ALL required fields
        if (typeof window !== 'undefined') {
          localStorage.setItem('veritas_session', JSON.stringify({
            uid: adminUser.uid,
            email: adminUser.email,
            displayName: adminUser.displayName,
            role: adminUser.role,
            createdAt: adminUser.createdAt
          }))
        }
        
        setMessage("✅ Admin access granted! Redirecting...")
        
        // Force a page refresh to ensure AuthContext picks up the new session
        // This helps with deployment timing issues
        setTimeout(() => {
          window.location.href = '/admin/dashboard/overview'
        }, 500)
      } else {
        setMessage("❌ Only admin@veritas.com is authorized for admin access.")
      }
    } catch (error) {
      setMessage("❌ Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef5ff]">
      <main className="flex-1">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-16 text-center md:py-24">
          <div className="mb-6">
            <div className="inline-block rounded-full bg-primary p-3">
              <Logo className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl font-headline font-bold tracking-tight text-gray-900 sm:text-5xl">Veritas</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Admin Portal - Secure Access
          </p>

          <div className="mt-12 w-full max-w-md">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Login
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground">
                    Passwordless authentication for secure admin access.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter your admin email to sign in instantly.
                  </p>
                </div>
                
                <form onSubmit={handlePasswordlessLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@veritas.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  {message && (
                    <div className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                      {message}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button variant="outline" className="bg-transparent" asChild>
                    <a href="/">
                      <ArrowRight className="mr-2 h-4 w-4" /> Back to Main Site
                    </a>
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
