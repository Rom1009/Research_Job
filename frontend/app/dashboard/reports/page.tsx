'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Clock } from 'lucide-react'


const hireRateData = [
  { month: 'Jan', hired: 4, interviewed: 12, shortlisted: 8 },
  { month: 'Feb', hired: 6, interviewed: 15, shortlisted: 10 },
  { month: 'Mar', hired: 8, interviewed: 18, shortlisted: 12 },
  { month: 'Apr', hired: 5, interviewed: 14, shortlisted: 9 },
  { month: 'May', hired: 9, interviewed: 20, shortlisted: 15 },
  { month: 'Jun', hired: 7, interviewed: 16, shortlisted: 11 },
]


const sourcesData = [
  { name: 'LinkedIn', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'GitHub', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Referral', value: 18, color: 'hsl(var(--chart-3))' },
  { name: 'Direct', value: 9, color: 'hsl(var(--chart-4))' },
]


const timeToHireData = [
  { week: 'Week 1', avgDays: 14 },
  { week: 'Week 2', avgDays: 12 },
  { week: 'Week 3', avgDays: 11 },
  { week: 'Week 4', avgDays: 13 },
  { week: 'Week 5', avgDays: 10 },
  { week: 'Week 6', avgDays: 9 },
]


export default function ReportsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">Comprehensive recruiting metrics and performance insights</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                Total Candidates
              </span>
              <Badge variant="secondary">+12%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">247</p>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="size-4" />
                Conversion Rate
              </span>
              <Badge variant="secondary">+5%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">18.2%</p>
            <p className="text-xs text-muted-foreground">avg this quarter</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="size-4" />
                Avg Time to Hire
              </span>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700">-2d</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">9 days</p>
            <p className="text-xs text-muted-foreground">down from 11 days</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Success Rate
              </span>
              <Badge variant="secondary">+8%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">92.3%</p>
            <p className="text-xs text-muted-foreground">retention @ 6mo</p>
          </CardContent>
        </Card>
      </div>


      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
          <TabsTrigger value="sources">Candidate Sources</TabsTrigger>
          <TabsTrigger value="timeline">Time to Hire</TabsTrigger>
        </TabsList>


        <TabsContent value="pipeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Pipeline Trends</CardTitle>
              <CardDescription>Interview, shortlist, and hire progression over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hireRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="shortlisted" fill="hsl(var(--chart-1))" name="Shortlisted" />
                  <Bar dataKey="interviewed" fill="hsl(var(--chart-2))" name="Interviewed" />
                  <Bar dataKey="hired" fill="hsl(var(--chart-3))" name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="sources" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Source Distribution</CardTitle>
              <CardDescription>Where qualified candidates come from</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {sourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-3">
                {sourcesData.map((source) => (
                  <div key={source.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{source.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Time to Hire Improvement</CardTitle>
              <CardDescription>Decreasing time to hire over 6 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeToHireData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgDays" stroke="hsl(var(--chart-1))" name="Avg Days to Hire" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}



