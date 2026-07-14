'use client'

import { useState } from 'react'
import { CandidatesTable } from '@/components/dashboard/candidates-table'
import { CandidateDetailPanel } from '@/components/dashboard/candidate-detail-panel'
import { Candidate } from '@/lib/candidates'

export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  return (
    <div className="flex gap-6 p-6">
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Click on any candidate to view details</p>
        </div>
        <CandidatesTable onSelectCandidate={setSelectedCandidate} />
      </div>
      
      {selectedCandidate && (
        <div className="w-80 border-l">
          <CandidateDetailPanel candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
        </div>
      )}
    </div>
  )
}
