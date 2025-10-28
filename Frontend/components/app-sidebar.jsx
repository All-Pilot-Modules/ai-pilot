"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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
import { LogOut, Settings, User, ChevronDown, LayoutDashboard, FolderOpen, HelpCircle, Users, Search, BookOpen } from "lucide-react";
import { apiClient } from "@/lib/auth";

export function AppSidebar(props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Check for 'module' param first, fall back to 'module_name' (used in review page)
  const module = searchParams?.get('module') || searchParams?.get('module_name');

  // Debug logging
  useEffect(() => {
    if (pathname.includes('/review')) {
      console.log('📍 Sidebar on review page - module:', module, 'from params:', {
        module: searchParams?.get('module'),
        module_name: searchParams?.get('module_name')
      });
    }
  }, [pathname, module, searchParams]);

  const { user, logout } = useAuth();
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingModules(true);
      const data = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      setModules(data || []);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoadingModules(false);
    }
  }, [user?.id]);

  // Fetch user's modules
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleModuleSwitch = (moduleName) => {
    // Keep the same page but change the module parameter
    const currentPath = pathname.split('?')[0];
    router.push(`${currentPath}?module=${moduleName}`);
  };

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
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push('/'); }}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">AP</span>
          </div>
          <span className="text-xl font-bold text-foreground">AI Pilot</span>
        </div>

        {/* Module Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="bg-sidebar-accent/50 dark:bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-sidebar-accent/70 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-muted-foreground">Module</span>
                    <span className="text-sm font-semibold text-foreground truncate capitalize">{module || 'Select module'}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch Module</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loadingModules ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">Loading modules...</span>
              </DropdownMenuItem>
            ) : modules.length > 0 ? (
              modules.map((mod) => (
                <DropdownMenuItem
                  key={mod.id}
                  onClick={() => handleModuleSwitch(mod.name)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">{mod.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                    </div>
                    <span className="capitalize truncate flex-1">{mod.name}</span>
                    {module === mod.name && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">No modules found</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/mymodules')}
              className="cursor-pointer text-blue-600 dark:text-blue-400"
            >
              <span>View all modules</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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