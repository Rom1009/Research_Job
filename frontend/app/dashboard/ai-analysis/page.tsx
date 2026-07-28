"use client";

import { Sparkles } from "lucide-react";
import { AIAnalysisReport } from "@/components/dashboard/ai-analysis-report";

export default function AIAnalysisPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-br from-purple-500/[0.06] via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-500">
            <Sparkles className="size-3.5" />
            INSIGHTS
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your AI Career Analysis
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Deep insights into your career match — skills radar, score
            distribution, top opportunities, and actionable advice for each job
            you've been matched against.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AIAnalysisReport />
      </div>
    </div>
  );
}
