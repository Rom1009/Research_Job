'use client'

import { CustomSidebar } from '@/components/dashboard/custom-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <CustomSidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <TooltipProvider>{children}</TooltipProvider>
        </main>
      </div>
    </AuthGuard>
  )
}