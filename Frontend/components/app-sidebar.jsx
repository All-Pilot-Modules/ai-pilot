"use client";

import { useSearchParams } from "next/navigation";
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
} from "@tabler/icons-react";

export function AppSidebar(props) {
  const searchParams = useSearchParams();
  const module = searchParams?.get('module'); // Get module from URL params
  const { user, logout } = useAuth();

  const navMain = [
    {
      title: "Dashboard",
      url: `/dashboard?module=${module}`,
      icon: IconDashboard,
    },
    {
      title: "Students",
      url: `/dashboard/students?module=${module}`,
      icon: IconChartBar,
    },
    {
      title: "Tests",
      url: `/dashboard/tests?module=${module}`,
      icon: IconFolder,
    },
    {
      title: "Analytics",
      url: `/dashboard/analytics?module=${module}`,
      icon: IconListDetails,
    },
  ];

  const navSecondary = [
    { title: "Settings", url: `/dashboard/settings?module=${module}`, icon: IconSettings },
    { title: "Get Help", url: `/dashboard/help?module=${module}`, icon: IconHelp },
    { title: "Search", url: `/dashboard/search?module=${module}`, icon: IconSearch },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  AI Pilot Dashboard.
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile_image} alt={user?.username} />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
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