'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { user } from '@/lib/data';
import {
  LogOut,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation items grouped by category
const primaryNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/diligence', icon: ShieldCheck, label: 'Diligence Hub' },
  { href: '/dashboard/memo', icon: FileText, label: 'Deal Memo' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
];

const secondaryNavItems = [
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const navItems = [
  ...primaryNavItems,
  ...secondaryNavItems,
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <>
          {/* Primary Navigation */}
          <SidebarGroup>
            <SidebarMenu>
              {primaryNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="block">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "group relative transition-all duration-200",
                          "hover:bg-sidebar-accent/80 hover:translate-x-0.5",
                          isActive && "bg-sidebar-accent shadow-sm"
                        )}
                      >
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                        )} />
                        <span className={cn(
                          "transition-colors",
                          isActive && "font-semibold"
                        )}>{item.label}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Secondary Navigation */}
          <SidebarGroup className="mt-auto pt-4 border-t border-sidebar-border">
            <SidebarMenu>
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="block">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "group relative transition-all duration-200",
                          "hover:bg-sidebar-accent/80 hover:translate-x-0.5",
                          isActive && "bg-sidebar-accent shadow-sm"
                        )}
                      >
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                        )} />
                        <span className={cn(
                          "transition-colors",
                          isActive && "font-semibold"
                        )}>{item.label}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </>
    )
}


export function DashboardNavHeader() {
    const pathname = usePathname();
    const currentNavItem = navItems.find(item => item.href === pathname) || 
                          navItems.find(item => pathname.startsWith(item.href));

    return (
        <header className="flex h-14 items-center gap-4 border-b border-border/40 bg-gradient-to-r from-background to-muted/20 px-4 shadow-sm backdrop-blur-sm lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden hover:bg-accent" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {currentNavItem && (
                <currentNavItem.icon className="h-5 w-5 text-muted-foreground lg:h-6 lg:w-6" />
              )}
              <h1 className="text-lg font-semibold text-foreground transition-colors md:text-xl lg:text-2xl">
                {currentNavItem?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full transition-all hover:bg-accent hover:shadow-sm" 
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full transition-all hover:bg-accent hover:shadow-sm"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border hover:ring-primary/50 transition-all">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/billing" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/support" className="flex items-center">
                    <span>Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-destructive focus:text-destructive">
                  <Link href="/" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
    )
}
