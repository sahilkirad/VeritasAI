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
} from '@/components/ui/sidebar';
import { user } from '@/lib/data';
import {
  LogOut,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Bot,
  FileText,
  CreditCard,
  MessageCircle, // Add this import
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/diligence', icon: ShieldCheck, label: 'Diligence Hub' },
  { href: '/dashboard/interview', icon: Bot, label: 'AI Interview' },
  { href: '/dashboard/memo', icon: FileText, label: 'Deal Memo' },
  { href: '/dashboard/create-room', icon: MessageCircle, label: 'Create a Room' }, // Add this line
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];


export function DashboardNav() {
    const pathname = usePathname();

    return (
         <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
    )
}


export function DashboardNavHeader() {
    const pathname = usePathname();
    const currentNavItem = navItems.find(item => item.href === pathname);


    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">
              {currentNavItem?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
  <Link href="/dashboard/settings">
    <Settings className="h-5 w-5" />
    <span className="sr-only">Settings</span>
  </Link>
</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/support">Support</Link>
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
          </div>
        </header>
    )
}
