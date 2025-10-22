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
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                isActive={isActiveItem(item.url)}
              >
                {item.icon && <item.icon className="!size-4" stroke={1.5} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>)
  );
}
