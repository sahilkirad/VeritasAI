"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      if (email === "admin@veritas.com") {
        // Create complete admin session
        const adminSession = {
          uid: 'admin-001',
          email: 'admin@veritas.com',
          displayName: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
        
        // Store in localStorage
        localStorage.setItem('veritas_session', JSON.stringify(adminSession))
        
        setMessage("✅ Admin access granted! Redirecting...")
        
        // Direct redirect to overview page
        setTimeout(() => {
          window.location.href = '/admin/dashboard/overview'
        }, 500)
      } else {
        setMessage("❌ Only admin@veritas.com is authorized.")
      }
    } catch (error) {
      setMessage("❌ Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef5ff] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Logo className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@veritas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {message && (
              <div className={`text-sm text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
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
        </CardContent>
      </Card>
    </div>
  )
}
