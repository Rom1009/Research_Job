"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  scoreTrend,
  scoreDistribution,
  competencyRadar,
  skillCoverage,
} from "@/lib/candidates"

const trendConfig = {
  avgScore: { label: "Avg AI score", color: "var(--chart-1)" },
  candidates: { label: "Candidates", color: "var(--chart-2)" },
} satisfies ChartConfig

const distConfig = {
  count: { label: "Candidates", color: "var(--chart-1)" },
} satisfies ChartConfig

const radarConfig = {
  pool: { label: "Pool average", color: "var(--chart-2)" },
  top: { label: "Top 3 candidates", color: "var(--chart-1)" },
} satisfies ChartConfig

const coverageConfig = {
  value: { label: "Coverage", color: "var(--chart-1)" },
} satisfies ChartConfig

export function AnalysisCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Model-derived insights across the active candidate pool.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList className="mb-4">
            <TabsTrigger value="trend">Score Trend</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="competency">Competencies</TabsTrigger>
            <TabsTrigger value="coverage">Skill Coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <ChartContainer config={trendConfig} className="h-[300px] w-full">
              <AreaChart data={scoreTrend} margin={{ left: 4, right: 12 }}>
                <defs>
                  <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-avgScore)"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-avgScore)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[50, 100]}
                  width={32}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="avgScore"
                  type="natural"
                  fill="url(#fillScore)"
                  stroke="var(--color-avgScore)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="distribution">
            <ChartContainer config={distConfig} className="h-[300px] w-full">
              <BarChart data={scoreDistribution} margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="band"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={28}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="competency">
            <ChartContainer
              config={radarConfig}
              className="mx-auto h-[300px] w-full"
            >
              <RadarChart data={competencyRadar}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <Radar
                  dataKey="pool"
                  fill="var(--color-pool)"
                  fillOpacity={0.25}
                  stroke="var(--color-pool)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="top"
                  fill="var(--color-top)"
                  fillOpacity={0.25}
                  stroke="var(--color-top)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="coverage">
            <ChartContainer config={coverageConfig} className="h-[300px] w-full">
              <BarChart
                data={skillCoverage}
                layout="vertical"
                margin={{ left: 12, right: 24 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="skill"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="value" radius={6} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
