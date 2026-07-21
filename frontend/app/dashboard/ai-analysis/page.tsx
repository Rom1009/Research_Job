"use client";


import { AIAnalysisReport } from "@/components/dashboard/ai-analysis-report";


export default function AIAnalysisPage() {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex flex-col leading-tight">
        <h1 className="text-3xl font-bold">AI Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Deep insights and recommendations
        </p>
      </div>
      <AIAnalysisReport />
    </div>
  );
}

