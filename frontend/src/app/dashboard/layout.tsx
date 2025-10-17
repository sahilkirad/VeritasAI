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
import { LogOut, MoreVertical } from "lucide-react"
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
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-accent" />
            <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">Veritas</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={userProfile?.displayName || "User"} />
                  <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{userProfile?.displayName || "User"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'User'} • {user?.email}
                  </p>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
