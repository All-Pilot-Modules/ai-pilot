"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

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
import { LogOut, Settings, User, ChevronDown, LayoutDashboard, FolderOpen, HelpCircle, Users, Search } from "lucide-react";

export function AppSidebar(props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const module = searchParams?.get('module');
  const { user, logout } = useAuth();

  const isActive = (url) => {
    const path = url.split('?')[0];
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const navMain = [
    {
      title: "Dashboard",
      url: `/dashboard?module=${module}`,
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      url: `/dashboard/documents?module=${module}`,
      icon: FolderOpen,
    },
    {
      title: "Questions",
      url: `/dashboard/questions?module=${module}`,
      icon: HelpCircle,
    },
    {
      title: "Students",
      url: `/dashboard/students?module=${module}`,
      icon: Users,
    },
  ];

  const navSecondary = [
    { title: "Settings", url: `/dashboard/settings?module=${module}`, icon: Settings },
    { title: "Search", url: `/dashboard/search?module=${module}`, icon: Search },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">AP</span>
          </div>
          <span className="text-xl font-bold text-foreground">AI Pilot</span>
        </div>

        {/* Module Selector */}
        <div className="bg-sidebar-accent/50 dark:bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-sidebar-accent/70 dark:hover:bg-gray-800/70 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gray-700 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{module?.charAt(0)?.toUpperCase() || 'M'}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground">Module</span>
                <span className="text-sm font-semibold text-foreground truncate">{module || 'No module'}</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.url)}
                    isActive={isActive(item.url)}
                    className="h-10"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.url)}
                    isActive={isActive(item.url)}
                    className="h-10"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profile_image} alt={user?.username} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {user?.email || user?.role || 'Teacher'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
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
      </SidebarFooter>
    </Sidebar>
  );
}