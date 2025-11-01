"use client"

import type React from "react"
import { Suspense } from "react"

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
  SidebarProvider,
} from "@/components/ui/sidebar"
import { LogOut, MoreVertical, Settings, CreditCard } from "lucide-react"
import { Logo } from "@/components/icons/logo"
import { DashboardNav, DashboardNavHeader } from "./nav"
import Link from "next/link"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar to-sidebar/95">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
              <Logo className="size-6" />
            </div>
            <div>
              <h1 className="font-headline text-lg font-bold text-sidebar-foreground leading-tight">Veritas</h1>
              <p className="text-xs text-sidebar-foreground/60 font-medium">AI Investment Platform</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-1">
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/50 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2.5 text-left text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm focus-visible:ring-2 active:scale-[0.98]">
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-border hover:ring-primary/50 transition-all">
                  <AvatarImage src="/placeholder.svg" alt={userProfile?.displayName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-semibold">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="truncate font-semibold text-sm">{userProfile?.displayName || "User"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'User'} • {user?.email?.split('@')[0] || 'User'}
                  </p>
                </div>
                <MoreVertical className="ml-auto size-4 text-sidebar-foreground/50" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Suspense>
          <DashboardNavHeader />
        </Suspense>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  );
}
