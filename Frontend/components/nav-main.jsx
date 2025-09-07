"use client"

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useRouter } from 'next/navigation'
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
  // const router = useRouter()
  const router = useRouter()
  return (
    (<SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
         
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
           
            <SidebarMenuItem key={item.title} >
              <SidebarMenuButton tooltip={item.title} onClick={() => router.push(item.url)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
           
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>)
  );
}
