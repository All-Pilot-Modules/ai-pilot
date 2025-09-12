"use client"

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Function to determine if a navigation item is active
  const isActiveItem = (itemUrl) => {
    // Extract the path part from the URL (before query params)
    const itemPath = itemUrl.split('?')[0]
    
    // For main dashboard, check exact match
    if (itemPath === '/dashboard') {
      return pathname === '/dashboard'
    }
    
    // For other routes, check if pathname starts with the item path
    return pathname.startsWith(itemPath)
  }
  
  return (
    (<SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu className="space-y-1.5">
          {items.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                onClick={() => router.push(item.url)}
                isActive={isActiveItem(item.url)}
                size="sm"
                className={`
                  relative group transition-all duration-300 h-10 px-3 py-2 rounded-lg
                  ${isActiveItem(item.url) 
                    ? 'bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 font-semibold shadow-sm' 
                    : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 font-medium text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300
                  ${isActiveItem(item.url) 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md scale-105' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400'
                  }
                `}>
                  {item.icon && <item.icon className="!size-4" stroke={1.5} />}
                </div>
                <span className="text-xs font-medium ml-1">{item.title}</span>
                {isActiveItem(item.url) && (
                  <div className="ml-auto flex items-center">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>)
  );
}
