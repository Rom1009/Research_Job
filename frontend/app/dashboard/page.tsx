'use client'

import { useState } from 'react'
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ProfileIntake } from "@/components/dashboard/profile-intake"
import { AnalysisCharts } from "@/components/dashboard/analysis-charts"
import { DashboardCandidateList } from "@/components/dashboard/dashboard-candidate-list"
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel"
import { CandidatesTable } from "@/components/dashboard/candidates-table"
import { JobScraping } from '@/components/dashboard/job-scraping'
import { AdvancedProfileIntake } from "@/components/dashboard/advanced-profile-intake"
import { AIAnalysisReport } from "@/components/dashboard/ai-analysis-report"
import { Candidate } from "@/lib/candidates"
import { useDashboardStore } from "@/lib/dashboard-store"

export default function DashboardPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const { activeTab } = useDashboardStore()

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col leading-tight">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Backend Squad · Q3 hiring cycle</p>
              </div>
              <Button>
                <Plus data-icon="inline-start" />
                New search
              </Button>
            </div>

            <StatCards />
            
            <DashboardCandidateList 
              onSelectCandidate={setSelectedCandidate}
              selectedCandidateId={selectedCandidate?.id}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-1">
                <ProfileIntake />
              </div>
              <div className="xl:col-span-2">
                <AnalysisCharts />
              </div>
            </div>
          </div>
        )
      
      case 'candidates':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col leading-tight">
              <h1 className="text-3xl font-bold">Candidates</h1>
              <p className="text-muted-foreground mt-1">View and manage all candidates</p>
            </div>
            <CandidatesTable onSelectCandidate={setSelectedCandidate} />
          </div>
        )
      
      case 'intake':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col leading-tight">
              <h1 className="text-3xl font-bold">Profile Intake</h1>
              <p className="text-muted-foreground mt-1">Submit new candidate profiles</p>
            </div>
            <ProfileIntake />
          </div>
        )
      
      case 'jobs':
                return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col leading-tight">
              <h1 className="text-3xl font-bold">Job Scraping</h1>
              <p className="text-muted-foreground mt-1">Start Job scraping</p>
            </div>
            <JobScraping />
          </div>
        )
      
      case 'analysis':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col leading-tight">
              <h1 className="text-3xl font-bold">AI Analysis</h1>
              <p className="text-muted-foreground mt-1">Deep insights and recommendations</p>
            </div>
            <AIAnalysisReport />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="relative w-full flex-1 flex flex-col overflow-hidden">
      {renderContent()}

      {/* Right Panel */}
      {selectedCandidate && (
        <DashboardRightPanel 
          selectedCandidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
