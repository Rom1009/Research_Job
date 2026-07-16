'use client'


import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { candidates, Candidate } from '@/lib/candidates'
import { useState } from 'react'


interface DashboardCandidateListProps {
  onSelectCandidate: (candidate: Candidate) => void
  selectedCandidateId?: string
}


export function DashboardCandidateList({ onSelectCandidate, selectedCandidateId }: DashboardCandidateListProps) {
  const [search, setSearch] = useState('')


  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.topSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  )


  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Qualified Candidates</CardTitle>
        <CardDescription>Click to view details in the right panel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or skills..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {filteredCandidates.map((candidate) => (
              <Button
                key={candidate.id}
                variant={selectedCandidateId === candidate.id ? 'default' : 'outline'}
                className="w-full justify-start h-auto p-3 text-left cursor-pointer hover:bg-muted"
                onClick={() => onSelectCandidate(candidate)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">{candidate.name}</p>
                    <Badge variant="secondary" className="ml-2">{candidate.score}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">{candidate.title}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.topSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs py-0">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Button>
            ))}
          </div>


          {filteredCandidates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No candidates found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}




