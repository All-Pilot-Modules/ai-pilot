"use client";
import * as React from "react"
import { useRouter, usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Function to determine if a navigation item is active
  const isActiveItem = (itemUrl) => {
    // Extract the path part from the URL (before query params)
    const itemPath = itemUrl.split('?')[0]
    
    // Check if pathname starts with the item path
    return pathname.startsWith(itemPath)
  }
  
  return (
    (<SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                onClick={() => router.push(item.url)}
                isActive={isActiveItem(item.url)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>)
  );
}
