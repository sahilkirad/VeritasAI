"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/icons/logo"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  TrendingUp, 
  Settings,
  Bell,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AdminDashboardClientProps {
  children: React.ReactNode
}

export function AdminDashboardClient({ children }: AdminDashboardClientProps) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    console.log('🔍 Admin layout - loading:', loading)
    console.log('🔍 Admin layout - user:', user)
    
    if (loading) return
    
    // Check session from localStorage
    const session = localStorage.getItem('veritas_session')
    console.log('🔍 Admin layout - session:', session)
    
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        console.log('🔍 Admin layout - sessionData:', sessionData)
        if (sessionData.role === 'admin') {
          console.log('✅ Admin layout - localStorage admin found')
          setIsAuthorized(true)
          setNotifications(3)
          return
        }
      } catch (e) {
        console.log('❌ Admin layout - session parse error:', e)
      }
    }
    
    // Check AuthContext
    if (user?.role === 'admin') {
      console.log('✅ Admin layout - AuthContext admin found')
      setIsAuthorized(true)
      setNotifications(3)
      return
    }
    
    console.log('❌ Admin layout - not authorized, redirecting to /admin')
    // Not authorized, redirect to admin login
    router.push('/admin')
  }, [user, loading, router])

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard/overview', icon: LayoutDashboard, current: pathname === '/admin/dashboard/overview' },
    { name: 'Memos', href: '/admin/dashboard/memos', icon: FileText, current: pathname === '/admin/dashboard/memos' },
    { name: 'Network', href: '/admin/dashboard/network', icon: Users, current: pathname === '/admin/dashboard/network' },
    { name: 'Recommendations', href: '/admin/dashboard/recommendations', icon: TrendingUp, current: pathname === '/admin/dashboard/recommendations' },
    { name: 'Reports', href: '/admin/dashboard/reports', icon: FileText, current: pathname === '/admin/dashboard/reports' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Logo className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">Veritas Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Logo className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold">Veritas Admin</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </button>

              {/* User menu */}
              <div className="flex items-center gap-x-2">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user?.displayName || 'Admin User'}
                  </div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
