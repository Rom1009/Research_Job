'use client'

import { AnalysisCharts } from '@/components/dashboard/analysis-charts'
import { AIAnalysisReport } from '@/components/dashboard/ai-analysis-report'
import { StatCards } from '@/components/dashboard/stat-cards'

export default function AIAnalysisPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Analysis</h1>
        <p className="text-muted-foreground mt-2">Deep insights and ML-powered candidate analysis</p>
      </div>
      
      <StatCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AnalysisCharts />
        </div>
        <div>
          <AIAnalysisReport />
        </div>
      </div>
    </div>
  )
}
