'use client'


import { Candidate } from '@/lib/candidates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { X, Mail, MapPin, Briefcase, Award, Code, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GithubIcon, LinkedinIcon } from './brand-icons'


interface CandidateDetailPanelProps {
  candidate: Candidate
  onClose: () => void
}


export function CandidateDetailPanel({ candidate, onClose }: CandidateDetailPanelProps) {
  const statusColors: Record<string, string> = {
    'completed': 'bg-emerald-500/20 text-emerald-700',
    'scheduled': 'bg-blue-500/20 text-blue-700',
    'not_started': 'bg-gray-500/20 text-gray-700',
    'rejected': 'bg-red-500/20 text-red-700',
  }


  const sourceColors: Record<string, string> = {
    'linkedin': 'bg-blue-500/20 text-blue-700',
    'github': 'bg-gray-500/20 text-gray-700',
    'referral': 'bg-purple-500/20 text-purple-700',
    'direct': 'bg-amber-500/20 text-amber-700',
    'recruiter': 'bg-teal-500/20 text-teal-700',
  }


  const availabilityLabel = {
    'immediate': 'Available Immediately',
    '2weeks': 'Available in 2 weeks',
    '1month': 'Available in 1 month',
    'negotiable': 'Availability Negotiable',
  }
  const interviewStatus = candidate.interviewStatus ?? "not_started"
  const availability = candidate.availability ?? "negotiable"
  const source = candidate.source ?? "direct"
  const reasoning = candidate.reasoning ?? "No specific reasoning provided."
  const certifications = candidate.certifications ?? []
  const projects = candidate.projects ?? []
  const companyHistory = candidate.companyHistory ?? []
  const cultureFit = candidate.cultureFit ?? 0


  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-4 pr-4">
        <div className="flex items-start justify-between gap-2 sticky top-0 bg-background/80 backdrop-blur-sm pb-4 pt-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{candidate.name}</h2>
            <p className="text-sm text-muted-foreground">{candidate.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>


        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
          </TabsList>


          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{candidate.score}% Match</Badge>
                  <Badge variant="outline" className={statusColors[interviewStatus]}>
                    {interviewStatus.replace('_', ' ')}
                  </Badge>
                </div>
               
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3.5" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="size-3.5" />
                    <span>{candidate.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className={sourceColors[source]}>
                      {source}
                    </Badge>
                  </div>
                </div>


                <div className="flex gap-2 pt-2">
                  {candidate.github && (
                    <a href={`https://github.com/${candidate.github}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1">
                        <GithubIcon className="size-3.5" />
                        GitHub
                      </Button>
                    </a>
                  )}
                  {candidate.linkedin && (
                    <a href={`https://linkedin.com/in/${candidate.linkedin}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1">
                        <LinkedinIcon className="size-3.5" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.topSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{availabilityLabel[availability as keyof typeof availabilityLabel]}</p>
                {candidate.salaryExpectation && (
                  <p className="text-muted-foreground mt-2">
                    ${candidate.salaryExpectation.min.toLocaleString()} - ${candidate.salaryExpectation.max.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>


            {candidate.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {candidate.notes}
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="experience" className="space-y-4 mt-4">
            {certifications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="size-4" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {certifications.map((cert, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}


            {projects.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code className="size-4" />
                    Key Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projects.map((project, i) => (
                    <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 flex items-center gap-1">
                          View <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}


            {companyHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Company History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyHistory.map((company, i) => (
                    <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium">{company.role}</p>
                      <p className="text-xs text-muted-foreground">{company.company} • {company.years} years</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="analysis" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Scoring Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(candidate.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium capitalize">{key}</label>
                      <span className="text-xs font-semibold">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Culture & Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Culture Fit</label>
                    <span className="text-xs font-semibold">{cultureFit}%</span>
                  </div>
                  <Progress value={cultureFit} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Skill Match</label>
                    <span className="text-xs font-semibold">{candidate.skillMatch}%</span>
                  </div>
                  <Progress value={candidate.skillMatch} className="h-2" />
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">{reasoning}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}