'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { cn } from '@/lib/utils';
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

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/diligence', icon: ShieldCheck, label: 'Diligence Hub' },
  { href: '/dashboard/memo', icon: FileText, label: 'Deal Memo' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
];

const utilityNavItems = [
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const navItems = [...mainNavItems, ...utilityNavItems];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
          <SidebarMenu className="space-y-1 px-2 flex-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="block">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "group relative w-full justify-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                        isActive 
                          ? "bg-gray-200 text-gray-900 font-semibold shadow-sm" 
                          : "text-gray-700 hover:bg-gray-200/50 hover:text-gray-900"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-purple-600" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                      )} />
                      <span className={cn(
                        "text-sm",
                        isActive && "font-semibold"
                      )}>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          
          {/* Utility items at bottom */}
          <div className="mt-auto px-2 pt-4 border-t border-gray-200">
            <SidebarMenu className="space-y-1">
              {utilityNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="block">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "group relative w-full justify-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                          isActive 
                            ? "bg-gray-200 text-gray-900 font-semibold shadow-sm" 
                            : "text-gray-700 hover:bg-gray-200/50 hover:text-gray-900"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-purple-600" />
                        )}
                        <item.icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isActive && "font-semibold"
                        )}>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </div>
    )
}


export function DashboardNavHeader() {
    const pathname = usePathname();
    const currentNavItem = navItems.find(item => pathname.startsWith(item.href));

    return (
        <header className="flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden text-gray-700 hover:bg-gray-100" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 md:text-xl font-headline">
              {currentNavItem?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8 bg-gray-300">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gray-400 text-gray-900">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-gray-900">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200">
                <DropdownMenuLabel className="text-gray-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100">
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100">
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">Support</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100">
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
