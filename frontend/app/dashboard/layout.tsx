'use client'

import { CustomSidebar } from '@/components/dashboard/custom-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <CustomSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </main>
    </div>
  )
}
