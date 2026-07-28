"use client";

import type { ReactNode } from "react";
import { CustomSidebar } from "@/components/dashboard/custom-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth-guard";
import { OfflineBanner } from "@/components/offline-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { OnboardingTour } from "@/components/onboarding-tour";
import { CommandPalette } from "@/components/command-palette";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <OnboardingTour /> {/* ← THÊM */}
      {/* Skip link cho keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <OfflineBanner />
      <div className="flex h-screen bg-background">
        <CustomSidebar />

        <main
          id="main-content"
          className="flex flex-1 flex-col overflow-hidden pt-16 lg:pt-0"
        >
          <ErrorBoundary>
            <TooltipProvider>
              <div className="flex flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </TooltipProvider>
          </ErrorBoundary>
        </main>
      </div>
      {/* Global overlays — mount ở cuối để z-index cao nhất */}
      <CommandPalette />
    </AuthGuard>
  );
}
