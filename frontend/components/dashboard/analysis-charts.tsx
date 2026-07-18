"use client";


import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api, type MatchResult, type UserProfile } from "@/lib/api";


const CHART_TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};


function weekKey(iso?: string): string {
  if (!iso) return "?";
  const d = new Date(iso);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}


export function AnalysisCharts() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listUsers(), api.listScores()])
      .then(([u, s]) => {
        if (cancelled) return;
        setUsers(u);
        setScores(s);
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);


  // ── Score trend by week ──
  const trend = useMemo(() => {
    const byWeek = new Map<string, { sum: number; count: number }>();
    scores.forEach((s) => {
      if (s.total_score == null) return;
      const k = weekKey(s.created_at);
      const bucket = byWeek.get(k) ?? { sum: 0, count: 0 };
      bucket.sum += s.total_score;
      bucket.count += 1;
      byWeek.set(k, bucket);
    });
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, b], i) => ({
        label: `W${i + 1}`,
        date: week,
        avgScore: Math.round(b.sum / b.count),
        count: b.count,
      }));
  }, [scores]);


  // ── Distribution ──
  const distribution = useMemo(() => {
    const buckets = [
      { range: "0-49", count: 0, fill: "#ef4444" },
      { range: "50-69", count: 0, fill: "#f59e0b" },
      { range: "70-84", count: 0, fill: "#3b82f6" },
      { range: "85-100", count: 0, fill: "#10b981" },
    ];
    scores.forEach((s) => {
      const v = s.total_score ?? 0;
      const idx = v >= 85 ? 3 : v >= 70 ? 2 : v >= 50 ? 1 : 0;
      buckets[idx].count += 1;
    });
    return buckets;
  }, [scores]);


  // ── Competencies radar (pool average) ──
  const competencies = useMemo(() => {
    if (scores.length === 0) {
      return [
        { dim: "Skills", value: 0 },
        { dim: "Education", value: 0 },
        { dim: "Experience", value: 0 },
        { dim: "Projects", value: 0 },
      ];
    }
    const avg = (fn: (s: MatchResult) => number) =>
      Math.round(scores.reduce((a, s) => a + fn(s), 0) / scores.length);
    return [
      { dim: "Skills", value: avg((s) => s.skill_score ?? 0) },
      { dim: "Education", value: avg((s) => s.education_score ?? 0) },
      { dim: "Experience", value: avg((s) => s.work_experience_score ?? 0) },
      { dim: "Projects", value: avg((s) => s.project_score ?? 0) },
    ];
  }, [scores]);


  // ── Skill coverage (top 8 skills across all users) ──
  const skillCoverage = useMemo(() => {
    const counter = new Map<string, number>();
    users.forEach((u) => {
      (u.cv_structured?.skills ?? []).forEach((s) => {
        counter.set(s, (counter.get(s) ?? 0) + 1);
      });
    });
    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));
  }, [users]);


  const hasAnyScore = scores.length > 0;
  const hasAnyUser = users.length > 0;


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              Model-derived insights across the active candidate pool.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {users.length} candidates
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {scores.length} matches
            </Badge>
          </div>
        </div>
      </CardHeader>


      <CardContent>
        {loading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <Tabs defaultValue="trend">
            <TabsList className="mb-4">
              <TabsTrigger value="trend">Score Trend</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="competency">Competencies</TabsTrigger>
              <TabsTrigger value="coverage">Skill Coverage</TabsTrigger>
            </TabsList>


            {/* SCORE TREND */}
            <TabsContent value="trend">
              {trend.length === 0 ? (
                <EmptyState message="No scores yet — run scoring to see the trend." />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={trend} margin={{ left: 4, right: 12, top: 8 }}>
                    <defs>
                      <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelFormatter={(_, p) => {
                        const d = p?.[0]?.payload;
                        return d ? `Week of ${d.date}` : "";
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fillScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>


            {/* DISTRIBUTION */}
            <TabsContent value="distribution">
              {!hasAnyScore ? (
                <EmptyState message="No scores to distribute." />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      fill="var(--primary)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>


            {/* COMPETENCIES */}
            <TabsContent value="competency">
              {!hasAnyScore ? (
                <EmptyState message="Run scoring to reveal competency breakdown." />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={competencies}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="dim"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.35}
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>


            {/* SKILL COVERAGE */}
            <TabsContent value="coverage">
              {!hasAnyUser || skillCoverage.length === 0 ? (
                <EmptyState message="Upload CVs to build the skill coverage chart." />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={skillCoverage}
                    layout="vertical"
                    margin={{ left: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      width={100}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                      fill="var(--primary)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}


function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

