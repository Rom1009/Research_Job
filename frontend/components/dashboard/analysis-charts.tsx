"use client";


import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
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
  LabelList,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Radar as RadarIcon,
  Layers,
  Sparkles,
  Award,
  Target,
  Users,
  Trophy,
} from "lucide-react";


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
import { cn } from "@/lib/utils";
import { api, type MatchResult, type UserProfile } from "@/lib/api";


const CHART_TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};


function weekKey(iso?: string): string {
  if (!iso) return "?";
  const d = new Date(iso);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}


function scoreTone(v: number) {
  if (v >= 80) return "text-emerald-500";
  if (v >= 60) return "text-amber-500";
  return "text-muted-foreground";
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


  // ── KPI strip ──
  const kpi = useMemo(() => {
    if (scores.length === 0)
      return { avg: 0, best: 0, qualified: 0, total: 0 };
    const total = scores.length;
    const avg = Math.round(
      scores.reduce((a, s) => a + (s.total_score ?? 0), 0) / total,
    );
    const best = Math.round(
      Math.max(...scores.map((s) => s.total_score ?? 0)),
    );
    const qualified = scores.filter((s) => (s.total_score ?? 0) >= 70).length;
    return { avg, best, qualified, total };
  }, [scores]);


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
      { range: "Poor", min: 0, count: 0, fill: "#ef4444" },
      { range: "Fair", min: 50, count: 0, fill: "#f59e0b" },
      { range: "Strong", min: 70, count: 0, fill: "#3b82f6" },
      { range: "Excellent", min: 85, count: 0, fill: "#10b981" },
    ];
    scores.forEach((s) => {
      const v = s.total_score ?? 0;
      const idx = v >= 85 ? 3 : v >= 70 ? 2 : v >= 50 ? 1 : 0;
      buckets[idx].count += 1;
    });
    return buckets;
  }, [scores]);


  // ── Competencies radar ──
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


  // ── Skill coverage ──
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


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[380px] w-full" />
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-primary/[0.02] via-transparent to-blue-500/[0.02]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              AI Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Model-derived insights across the active candidate pool.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1.5 py-1">
              <Users className="size-3" />
              {users.length} candidates
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1">
              <Layers className="size-3" />
              {scores.length} matches
            </Badge>
          </div>
        </div>


        {/* KPI strip — always visible */}
        {hasAnyScore && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            <KpiTile
              icon={Trophy}
              label="Best"
              value={kpi.best}
              tone="text-emerald-500"
            />
            <KpiTile
              icon={TrendingUp}
              label="Average"
              value={kpi.avg}
              tone={scoreTone(kpi.avg)}
            />
            <KpiTile
              icon={Target}
              label="Qualified"
              value={kpi.qualified}
              suffix={`/${kpi.total}`}
              tone="text-blue-500"
            />
            <KpiTile
              icon={Award}
              label="Skills"
              value={skillCoverage.length}
              tone="text-purple-500"
            />
          </div>
        )}
      </CardHeader>


      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList className="mb-4 grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
            <TabTrigger value="trend" icon={TrendingUp} label="Trend" />
            <TabTrigger
              value="distribution"
              icon={BarChart3}
              label="Distribution"
            />
            <TabTrigger value="competency" icon={RadarIcon} label="Competencies" />
            <TabTrigger value="coverage" icon={Layers} label="Skills" />
          </TabsList>


          {/* ── SCORE TREND ── */}
          <TabsContent value="trend">
            {trend.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No scores yet"
                message="Run scoring to see the weekly trend."
              />
            ) : trend.length < 2 ? (
              <SingleWeekView point={trend[0]} avg={kpi.avg} best={kpi.best} />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart
                  data={trend}
                  margin={{ left: -12, right: 12, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 50, 70, 85, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    cursor={{
                      stroke: "var(--primary)",
                      strokeDasharray: "3 3",
                    }}
                    labelFormatter={(_, p) => {
                      const d = p?.[0]?.payload;
                      return d ? `Week of ${d.date}` : "";
                    }}
                    formatter={(v: any, _n, p: any) => [
                      `${v}/100 · ${p?.payload?.count} matches`,
                      "Avg score",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#fillScore)"
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: "var(--primary)",
                      stroke: "var(--background)",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>


          {/* ── DISTRIBUTION ── */}
          <TabsContent value="distribution">
            {!hasAnyScore ? (
              <EmptyState
                icon={BarChart3}
                title="No matches to distribute"
                message="Score some jobs to see the spread."
              />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={distribution}
                  margin={{ left: -12, right: 12, top: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                    formatter={(v: any) => [
                      `${v} match${v === 1 ? "" : "es"}`,
                      "Count",
                    ]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={70}>
                    {distribution.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      fill="var(--foreground)"
                      fontSize={12}
                      fontWeight={600}
                      formatter={(v: any) => (v > 0 ? v : "")}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>


          {/* ── COMPETENCIES ── */}
          <TabsContent value="competency">
            {!hasAnyScore ? (
              <EmptyState
                icon={RadarIcon}
                title="No competency data"
                message="Scoring will reveal skill/education/experience/project breakdown."
              />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={competencies} outerRadius="75%">
                  <defs>
                    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.1} />
                    </radialGradient>
                  </defs>
                  <PolarGrid stroke="var(--border)" strokeDasharray="2 4" />
                  <PolarAngleAxis
                    dataKey="dim"
                    tick={{
                      fill: "var(--foreground)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 9,
                      opacity: 0.4,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={3}
                    angle={90}
                  />
                  <Radar
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#radarGradient)"
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: any) => [`${v}/100`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>


          {/* ── SKILL COVERAGE ── */}
          <TabsContent value="coverage">
            {!hasAnyUser || skillCoverage.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No skills extracted yet"
                message="Upload CVs to build the skill coverage chart."
              />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={skillCoverage}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                    opacity={0.5}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    width={110}
                    tick={{
                      fill: "var(--foreground)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                    formatter={(v: any) => [
                      `${v} candidate${v === 1 ? "" : "s"}`,
                      "Coverage",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 8, 8, 0]}
                    fill="url(#skillGradient)"
                    maxBarSize={26}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      fill="var(--foreground)"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


// ═════════════════════ SUB-COMPONENTS ═════════════════════


function KpiTile({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  suffix?: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-0.5">
        <span className={cn("font-mono text-2xl font-bold tabular-nums", tone)}>
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}


function TabTrigger({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <TabsTrigger value={value} className="gap-1.5 text-xs">
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  );
}


function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
}) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}


/** Khi chỉ có 1 tuần data — hiển thị big number thay vì cố vẽ line rỗng */
function SingleWeekView({
  point,
  avg,
  best,
}: {
  point: { label: string; date: string; avgScore: number; count: number };
  avg: number;
  best: number;
}) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center gap-6 rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.05] via-transparent to-blue-500/[0.05]">
      <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <TrendingUp className="size-3" />
        First week of data
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Average score · Week of {point.date}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-6xl font-bold tabular-nums",
            scoreTone(point.avgScore),
          )}
        >
          {point.avgScore}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          across {point.count} match{point.count === 1 ? "" : "es"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center text-xs">
        <div>
          <p className="text-muted-foreground">Best this week</p>
          <p className={cn("font-mono text-lg font-bold", scoreTone(best))}>
            {best}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Pool average</p>
          <p className={cn("font-mono text-lg font-bold", scoreTone(avg))}>
            {avg}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Trend chart appears after 2+ weeks of scoring
      </p>
    </div>
  );
}

