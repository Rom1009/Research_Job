"use client";

import { useState } from "react";
import { CandidatesTable } from "@/components/dashboard/candidates-table";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";
import type { CandidateProfile } from "@/lib/api";


export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateProfile | null>(null);

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex flex-col leading-tight">
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all candidates
          </p>
        </div>
        <CandidatesTable onSelectCandidate={setSelectedCandidate} />
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
