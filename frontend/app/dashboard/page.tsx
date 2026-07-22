"use client";


import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AnalysisCharts } from "@/components/dashboard/analysis-charts";
import { DashboardCandidateList } from "@/components/dashboard/dashboard-candidate-list";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";
import type { CandidateProfile } from "@/lib/api";


export default function OverviewPage() {
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateProfile | null>(null);


  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="mt-1 text-muted-foreground">
              Backend Squad · Q3 hiring cycle
            </p>
          </div>
          <Button>
            <Plus data-icon="inline-start" />
            New search
          </Button>
        </div>


        <StatCards />


        <DashboardCandidateList
          onSelectCandidate={setSelectedCandidate}
          selectedCandidateId={selectedCandidate?.candidate_id}
        />


        <AnalysisCharts />
      </div>


      {selectedCandidate && (
        <DashboardRightPanel
          selectedCandidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

