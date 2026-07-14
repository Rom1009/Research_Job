'use client'

import { X, Award, Briefcase, BarChart3, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Candidate } from '@/lib/candidates'

interface DashboardRightPanelProps {
  selectedCandidate: Candidate | null
  onClose: () => void
}

export function DashboardRightPanel({ selectedCandidate, onClose }: DashboardRightPanelProps) {
  if (!selectedCandidate) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md border-l border-border bg-background shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">Candidate Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="profile" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                    {selectedCandidate.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCandidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCandidate.title}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{selectedCandidate.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Experience</p>
                  <p className="font-medium">{selectedCandidate.experience} years</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <Badge variant={selectedCandidate.status === 'Shortlisted' ? 'default' : 'secondary'}>
                  {selectedCandidate.status}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.topSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Source</p>
                <Badge variant="secondary" className="capitalize">{selectedCandidate.source}</Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Availability</p>
                <p className="font-medium capitalize">{selectedCandidate.availability}</p>
              </div>

              {selectedCandidate.salaryExpectation && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Salary Expectation</p>
                  <p className="font-medium">
                    ${selectedCandidate.salaryExpectation.min.toLocaleString()} - ${selectedCandidate.salaryExpectation.max.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.certifications.map((cert) => (
                    <div key={cert} className="text-sm p-2 rounded-lg bg-muted">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Company History
                </h4>
                <div className="space-y-3">
                  {selectedCandidate.companyHistory.map((company, idx) => (
                    <div key={idx} className="text-sm p-3 rounded-lg border border-border">
                      <p className="font-semibold">{company.company}</p>
                      <p className="text-xs text-muted-foreground">{company.role}</p>
                      <p className="text-xs text-muted-foreground">{company.years} years</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Projects</h4>
                <div className="space-y-3">
                  {selectedCandidate.projects.map((project, idx) => (
                    <div key={idx} className="text-sm p-3 rounded-lg border border-border">
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Score Breakdown
                </h4>
                <div className="space-y-3">
                  {Object.entries(selectedCandidate.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm capitalize font-medium">{key}</p>
                        <p className="text-sm font-semibold">{value}%</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-400 h-full transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-primary">{selectedCandidate.score}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-1">Culture Fit</p>
                    <p className="text-2xl font-bold text-blue-500">{selectedCandidate.cultureFit}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Interview Status</p>
                <Badge className="capitalize" variant={selectedCandidate.interviewStatus === 'completed' ? 'default' : 'secondary'}>
                  {selectedCandidate.interviewStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h4>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm leading-relaxed">{selectedCandidate.notes}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Interview Notes</p>
                <div className="space-y-2">
                  <p className="text-sm p-3 rounded-lg bg-muted/50 border border-border">
                    {selectedCandidate.interviewStatus === 'completed' 
                      ? 'Strong technical foundation with excellent problem-solving skills. Excellent communication during the technical round.'
                      : 'No interview notes yet.'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
