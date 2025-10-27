"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useEffect } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  LogOut, 
  MoreVertical, 
  Settings, 
  Users, 
  FileText, 
  TrendingUp,
  Bot,
  Shield
} from "lucide-react"
import { Logo } from "@/components/icons/logo"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/startups", icon: Users, label: "Startups" },
  { href: "/admin/investors", icon: Shield, label: "Investors" },
  { href: "/admin/memos", icon: FileText, label: "Memos" },
  { href: "/admin/deals", icon: TrendingUp, label: "Deals" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

function AdminDashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, logout, loading } = useAuth()

  // Auth protection - redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
      console.log('✅ Logged out successfully from admin dashboard')
      // Redirect to main page after logout
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Still redirect even if logout fails
      router.push('/')
    }
  }

  const pageTitle = navItems.find((item) => pathname.startsWith(item.href))?.label || "Admin Dashboard"

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render sidebar if not authenticated
  if (!user || user.role !== 'admin') {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">Admin Console</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg"
                    alt={userProfile?.displayName || "Admin"}
                    data-ai-hint="admin face"
                  />
                  <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{userProfile?.displayName || "Admin"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={userProfile?.displayName || "Admin"}
                      data-ai-hint="admin face"
                    />
                    <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{userProfile?.displayName || "Admin"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Only show sidebar for dashboard pages, not for signup/login
  if (pathname === '/admin/signup' || pathname === '/admin/login') {
    return <>{children}</>
  }
  
  return <AdminDashboardContent>{children}</AdminDashboardContent>
}
