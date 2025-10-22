"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useSearchParams } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const module = searchParams?.get('module')
  
  // Get current page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname.includes('/dashboard/documents')) return 'Documents'
    if (pathname.includes('/dashboard/questions')) return 'Questions'
    if (pathname.includes('/dashboard/students')) return 'Students'
    if (pathname.includes('/dashboard/tests')) return 'Tests'
    if (pathname.includes('/dashboard/analytics')) return 'Analytics'
    if (pathname.includes('/dashboard/settings')) return 'Settings'
    if (pathname.includes('/dashboard/help')) return 'Get Help'
    if (pathname.includes('/dashboard/search')) return 'Search'
    return 'Dashboard'
  }
  
  return (
    (<header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Dashboard</span>
          {pathname !== '/dashboard' && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{getPageTitle()}</span>
            </>
          )}
          {module && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                {module}
              </span>
            </>
          )}
        </div>
      </div>
    </header>)
  );
}
