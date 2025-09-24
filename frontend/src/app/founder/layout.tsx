"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { Bot, FileText, LayoutDashboard, LogOut, MoreVertical, Settings, Users, Shield } from "lucide-react"
import { Logo } from "@/components/icons/logo"

// Mock founder data
const founder = {
  name: "Priya Founder",
  email: "priya@quantumleap.ai",
  avatar: "https://picsum.photos/seed/2/100/100",
}

const navItems = [
  { href: "/founder/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/founder/dashboard/documents", icon: FileText, label: "Pitch Hub" },
  { href: "/founder/dashboard/datarooms", icon: Shield, label: "Investor Rooms" },
  { href: "/founder/dashboard/feedback", icon: Bot, label: "AI Feedback" },
  { href: "/founder/dashboard/investors", icon: Users, label: "Investor Interest" },
  { href: "/founder/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function FounderDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isLoginPage = pathname === "/founder/login"

  const pageTitle = isLoginPage
    ? "Founder Login"
    : navItems.find((item) => pathname.startsWith(item.href))?.label || "Dashboard"

  if (isLoginPage) {
    return (
      <div className="bg-background">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline">Veritas</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">{pageTitle}</h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    )
  }

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
                    src={founder.avatar || "/placeholder.svg"}
                    alt={founder.name}
                    data-ai-hint="woman face"
                  />
                  <AvatarFallback>{founder.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{founder.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">{founder.email}</p>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/founder/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
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
                      src={founder.avatar || "/placeholder.svg"}
                      alt={founder.name}
                      data-ai-hint="woman face"
                    />
                    <AvatarFallback>{founder.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{founder.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/founder/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
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
