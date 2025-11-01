"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"

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
import { Bot, FileText, LayoutDashboard, LogOut, MoreVertical, Settings, Users, Shield, User, Sparkles } from "lucide-react"
import { Logo } from "@/components/icons/logo"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { href: "/founder/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/founder/dashboard/profile", icon: User, label: "Profile" },
  { href: "/founder/dashboard/documents", icon: FileText, label: "Pitch Hub" },
  { href: "/founder/dashboard/investor-match", icon: Sparkles, label: "Investor Match" },
  { href: "/founder/dashboard/datarooms", icon: Shield, label: "Investor Rooms" },
  { href: "/founder/dashboard/feedback", icon: Bot, label: "AI Feedback" },
  { href: "/founder/dashboard/investors", icon: Users, label: "Investor Interest" },
  { href: "/founder/dashboard/settings", icon: Settings, label: "Settings" },
]

function FounderDashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      console.log('✅ Logged out successfully from founder dashboard')
      // Redirect to main page after logout
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Still redirect even if logout fails
      router.push('/')
    }
  }

  const pageTitle = navItems.find((item) => pathname.startsWith(item.href))?.label || "Dashboard"


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">Founder Co-Pilot</h1>
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
                    alt={userProfile?.displayName || "User"}
                    data-ai-hint="user face"
                  />
                  <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{userProfile?.displayName || "User"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/founder/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/founder/dashboard/settings">Settings</Link>
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
                      alt={userProfile?.displayName || "User"}
                      data-ai-hint="user face"
                    />
                    <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{userProfile?.displayName || "User"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/founder/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/founder/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
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

export default function FounderDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Only show sidebar for dashboard pages, not for signup/login
  if (pathname === '/founder/signup' || pathname === '/founder/login') {
    return <>{children}</>
  }
  
  return <FounderDashboardContent>{children}</FounderDashboardContent>
}
