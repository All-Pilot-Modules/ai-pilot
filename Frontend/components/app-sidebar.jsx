"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import {
  IconInnerShadowTop,
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconSettings,
  IconHelp,
  IconSearch,
  IconQuestionMark,
} from "@tabler/icons-react";

export function AppSidebar(props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const module = searchParams?.get('module'); // Get module from URL params
  const { user, logout } = useAuth();

  const navMain = [
    {
      title: "Dashboard",
      url: `/dashboard?module=${module}`,
      icon: IconDashboard,
    },
    {
      title: "Documents",
      url: `/dashboard/documents?module=${module}`,
      icon: IconFolder,
    },
    {
      title: "Questions",
      url: `/dashboard/questions?module=${module}`,
      icon: IconQuestionMark,
    },
    {
      title: "Students",
      url: `/dashboard/students?module=${module}`,
      icon: IconChartBar,
    },
  ];

  const navSecondary = [
    { title: "Settings", url: `/dashboard/settings?module=${module}`, icon: IconSettings },
    { title: "Get Help", url: `/dashboard/help?module=${module}`, icon: IconHelp },
    { title: "Search", url: `/dashboard/search?module=${module}`, icon: IconSearch },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-5 hover:bg-blue-100 dark:hover:bg-blue-950/50 cursor-pointer transition-colors">
              <button onClick={() => router.push('/')} className="flex items-center gap-4 w-full">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <IconInnerShadowTop className="!size-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Pilot
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Education Platform
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900/50">
                <AvatarImage src={user?.profile_image} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize font-medium">
                {user?.role || 'Teacher'} • Online
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/50">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}