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
      <Sidebar className="bg-gray-100 border-r border-gray-200">
        <SidebarHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center justify-center size-12 rounded-lg bg-purple-200/80 ring-2 ring-purple-300/50 shadow-sm">
              <Logo className="size-7" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline text-xl font-bold text-gray-900 leading-tight">Veritas</h1>
              <p className="text-xs text-gray-600 font-medium">AI Investment Platform</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-gray-100">
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="border-t border-gray-200 bg-gray-100 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2.5 text-left text-sm text-gray-900 outline-none transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-purple-500/20">
                <Avatar className="h-9 w-9 bg-gray-300">
                  <AvatarImage src="/placeholder.svg" alt={userProfile?.displayName || "User"} />
                  <AvatarFallback className="bg-gray-400 text-gray-900 font-semibold">
                    {(userProfile?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="truncate font-bold text-sm text-gray-900">{userProfile?.displayName || "User"}</p>
                  <p className="truncate text-xs text-gray-600">
                    {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Investor'} • {user?.email || 'user@example.com'}
                  </p>
                </div>
                <MoreVertical className="ml-auto size-5 text-gray-600" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
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
