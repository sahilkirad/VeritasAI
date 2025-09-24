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
import { user } from "@/lib/data"
import { LogOut, MoreVertical } from "lucide-react"
import { Logo } from "@/components/icons/logo"
import { DashboardNav, DashboardNavHeader } from "./nav"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
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
        <Suspense>
          <DashboardNavHeader />
        </Suspense>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
