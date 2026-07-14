'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Chart, ChartConfig, ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts'
import { AlertCircle, TrendingUp, Users, Target, Zap } from 'lucide-react'

// Skill gap analysis
const skillGapData = [
  { skill: 'System Design', required: 95, current: 72, gap: 23 },
  { skill: 'TypeScript', required: 90, current: 85, gap: 5 },
  { skill: 'React Patterns', required: 85, current: 60, gap: 25 },
  { skill: 'Databases', required: 80, current: 70, gap: 10 },
  { skill: 'AWS', required: 75, current: 45, gap: 30 },
]

// Culture fit distribution
const cultureFitData = [
  { name: 'Exceptional (90-100)', value: 12, fill: '#10b981' },
  { name: 'Strong (75-89)', value: 28, fill: '#3b82f6' },
  { name: 'Good (60-74)', value: 18, fill: '#f59e0b' },
  { name: 'Needs Work (0-59)', value: 4, fill: '#ef4444' },
]

// Experience vs Score scatter
const experienceScatterData = [
  { experience: 2, score: 65, name: 'Junior 1' },
  { experience: 3, score: 72, name: 'Junior 2' },
  { experience: 5, score: 78, name: 'Mid 1' },
  { experience: 6, score: 88, name: 'Mid 2' },
  { experience: 7, score: 84, name: 'Senior 1' },
  { experience: 8, score: 94, name: 'Senior 2' },
  { experience: 10, score: 91, name: 'Staff 1' },
  { experience: 12, score: 89, name: 'Staff 2' },
]

// Hiring recommendations
const recommendations = [
  {
    title: 'Fast Track Interview',
    description: '5 candidates score >85. Schedule within 48 hours.',
    priority: 'high',
    icon: Zap,
  },
  {
    title: 'Skill Gap Training',
    description: 'System Design scores 30pt below requirement. Prepare interview guides.',
    priority: 'medium',
    icon: Target,
  },
  {
    title: 'Diversity Opportunity',
    description: 'Underrepresented backgrounds in current pool. Expand sourcing.',
    priority: 'medium',
    icon: Users,
  },
]

export function AIAnalysisReport() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold">82.1</p>
              <p className="text-xs text-emerald-500">↑ 5.2% vs last week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Top Candidates</p>
              <p className="text-3xl font-bold">12</p>
              <p className="text-xs text-blue-500">{'Score >85'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Culture Fit Avg</p>
              <p className="text-3xl font-bold">84%</p>
              <p className="text-xs text-purple-500">Strong alignment</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ready Now</p>
              <p className="text-3xl font-bold">8</p>
              <p className="text-xs text-amber-500">Immediate availability</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Required vs Current Pool Performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGapData.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.skill}</span>
                  <span className="text-muted-foreground">Gap: {skill.gap} pts</span>
                </div>
                <div className="flex gap-2 h-8">
                  <div className="flex-1 bg-primary/20 rounded-sm flex items-center px-2">
                    <Progress value={skill.required} className="w-full h-6" />
                    <span className="text-xs font-medium ml-2">{skill.required}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">Required</div>
                </div>
                <div className="flex gap-2 h-8">
                  <div className="flex-1 bg-accent/20 rounded-sm flex items-center px-2">
                    <Progress value={skill.current} className="w-full h-6" />
                    <span className="text-xs font-medium ml-2">{skill.current}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">Current</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Culture Fit Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Culture Fit Distribution</CardTitle>
            <CardDescription>Candidate alignment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cultureFitData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm flex-1">{item.name}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience vs Score */}
        <Card>
          <CardHeader>
            <CardTitle>Experience vs Performance</CardTitle>
            <CardDescription>Score trend by seniority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="experience"
                  name="Years of Experience"
                />
                <YAxis type="number" dataKey="score" name="Score" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Candidates"
                  data={experienceScatterData}
                  fill="var(--color-primary)"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hiring Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Actionable insights for your hiring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon
            const bgColor =
              rec.priority === 'high'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'

            return (
              <div
                key={idx}
                className={`rounded-lg border p-4 ${bgColor} space-y-2`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="size-5 mt-0.5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                  <Badge
                    variant={rec.priority === 'high' ? 'destructive' : 'default'}
                  >
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <AlertCircle className="size-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Pool Quality</p>
              <p className="text-muted-foreground">
                Your candidate pool quality is in the 75th percentile compared to industry benchmarks. Focus on addressing System Design gaps.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <TrendingUp className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Trend Analysis</p>
              <p className="text-muted-foreground">
                Average candidate scores are increasing 2-3pts weekly. ML candidates trending highest at 89/100 average.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Users className="size-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Diversity Metrics</p>
              <p className="text-muted-foreground">
                Current pool lacks geographic diversity. Consider sourcing from non-traditional backgrounds to improve inclusion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
