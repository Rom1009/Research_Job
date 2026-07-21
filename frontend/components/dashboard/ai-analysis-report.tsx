"use client";


import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Zap,
  Sparkles,
  Award,
  Lightbulb,
  FileWarning,
  ChevronDown,
  X,
} from "lucide-react";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api, type UserProfile, type MatchResult } from "@/lib/api";
import { useDashboardStore } from "@/lib/dashboard-store";


// ─────────────────── TYPES ───────────────────


type ScoreBucket = "all" | "excellent" | "strong" | "fair" | "poor";


// ─────────────────── HELPERS ───────────────────


function handleFromUrl(url?: string): string {
  if (!url) return "unknown";
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, "").split("/")[0] || u.hostname;
  } catch {
    return url;
  }
}


function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-muted-foreground";
}


function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/30";
  return "bg-muted/30 border-border";
}


function matchContainsTerm(m: MatchResult, term: string): boolean {
  const ai = m.ai_analysis_details;
  if (!ai) return false;
  const all = [
    ...(ai.matched_skills ?? []),
    ...(ai.gap_analysis ?? []),
    ...(ai.actionable_advice ?? []),
    ...(ai.project_impact ?? []),
    ...(ai.technical_complexity ?? []),
  ];
  const q = term.toLowerCase();
  return all.some((x) => x.toLowerCase().includes(q));
}


// ─────────────────── MAIN ───────────────────


export function AIAnalysisReport() {
  const activeProfileId = useDashboardStore((s) => s.activeProfileId);
  const setActiveProfileId = useDashboardStore((s) => s.setActiveProfileId);


  const [users, setUsers] = useState<UserProfile[]>([]);
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [highlightTerm, setHighlightTerm] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    api
      .listUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        if (!activeProfileId && data.length > 0) {
          setActiveProfileId(data[0].user_id);
        }
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoadingUsers(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!activeProfileId) {
      setScores([]);
      return;
    }
    setLoadingScores(true);
    setHighlightTerm(null);
    api
      .getUserScores(activeProfileId)
      .then(setScores)
      .catch(console.error)
      .finally(() => setLoadingScores(false));
  }, [activeProfileId]);


  const currentUser = users.find((u) => u.user_id === activeProfileId);


  const metrics = useMemo(() => {
    if (scores.length === 0) {
      return {
        total: 0,
        avg: 0,
        best: 0,
        qualified: 0,
        avgSkill: 0,
        avgEducation: 0,
        avgWork: 0,
        avgProject: 0,
      };
    }
    const sum = (fn: (s: MatchResult) => number) =>
      scores.reduce((a, s) => a + fn(s), 0);
    const total = scores.length;
    return {
      total,
      avg: sum((s) => s.total_score ?? 0) / total,
      best: Math.max(...scores.map((s) => s.total_score ?? 0)),
      qualified: scores.filter((s) => (s.total_score ?? 0) >= 70).length,
      avgSkill: sum((s) => s.skill_score ?? 0) / total,
      avgEducation: sum((s) => s.education_score ?? 0) / total,
      avgWork: sum((s) => s.work_experience_score ?? 0) / total,
      avgProject: sum((s) => s.project_score ?? 0) / total,
    };
  }, [scores]);


  const radarData = useMemo(
    () => [
      { dim: "Skills", value: Math.round(metrics.avgSkill) },
      { dim: "Education", value: Math.round(metrics.avgEducation) },
      { dim: "Experience", value: Math.round(metrics.avgWork) },
      { dim: "Projects", value: Math.round(metrics.avgProject) },
    ],
    [metrics],
  );


  const topMatches = useMemo(
    () =>
      [...scores]
        .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))
        .slice(0, 5),
    [scores],
  );


  const distribution = useMemo(() => {
    const buckets = [
      { name: "Excellent (85+)", count: 0, color: "#10b981" },
      { name: "Strong (70-84)", count: 0, color: "#3b82f6" },
      { name: "Fair (50-69)", count: 0, color: "#f59e0b" },
      { name: "Poor (<50)", count: 0, color: "#ef4444" },
    ];
    scores.forEach((s) => {
      const v = s.total_score ?? 0;
      const b =
        v >= 85 ? buckets[0]
        : v >= 70 ? buckets[1]
        : v >= 50 ? buckets[2]
        : buckets[3];
      b.count++;
    });
    return buckets.map((b, i) => ({ ...b, fill: `url(#barFill-${i})` }));
  }, [scores]);


  // ─────────────────────── RENDER ───────────────────────


  if (loadingUsers) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }


  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No candidates yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CV to see AI analysis here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                AI Analysis Report
              </CardTitle>
              <CardDescription>
                LLM-driven insights combining CV, GitHub activity, and job match
                signals.
              </CardDescription>
            </div>
            <div className="min-w-[240px]">
              <Select
                value={activeProfileId ?? ""}
                onValueChange={(v) => v && setActiveProfileId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {handleFromUrl(u.github_url)} · {u.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Best match"
          value={Math.round(metrics.best)}
          hint={
            metrics.best >= 80
              ? "Excellent fit"
              : metrics.best >= 60
                ? "Consider interview"
                : "Below threshold"
          }
          tone={scoreTone(metrics.best)}
          icon={Award}
        />
        <MetricCard
          label="Avg score"
          value={Math.round(metrics.avg)}
          hint={`Across ${metrics.total} jobs`}
          tone={scoreTone(metrics.avg)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Qualified"
          value={metrics.qualified}
          hint={
            metrics.total > 0
              ? `${Math.round((metrics.qualified / metrics.total) * 100)}% of pool`
              : "—"
          }
          tone="text-blue-500"
          icon={Target}
        />
        <MetricCard
          label="Jobs scored"
          value={metrics.total}
          hint={
            currentUser?.created_at
              ? `since ${new Date(currentUser.created_at).toLocaleDateString()}`
              : "—"
          }
          tone="text-purple-500"
          icon={Zap}
        />
      </div>


      {loadingScores ? (
        <Skeleton className="h-96 w-full" />
      ) : scores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No scores yet</h3>
              <p className="text-sm text-muted-foreground">
                Go to the Jobs page → Start scraping → Start scoring for this
                candidate.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="per-job">
              All Jobs
              <Badge variant="secondary" className="ml-2">
                {scores.length}
              </Badge>
            </TabsTrigger>
          </TabsList>


          {/* ══════════════════ TAB 1: OVERVIEW ══════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RadarCard data={radarData} />
              <DistributionCard data={distribution} />
            </div>


            {highlightTerm && (
              <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/[0.06] px-4 py-2 text-sm">
                <span>
                  Filtering by:{" "}
                  <span className="font-semibold text-primary">
                    "{highlightTerm}"
                  </span>{" "}
                  <span className="text-muted-foreground">
                    · matching jobs highlighted, others dimmed
                  </span>
                </span>
                <button
                  onClick={() => setHighlightTerm(null)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <X className="size-3" /> Clear
                </button>
              </div>
            )}


            {/* Top 5 Matches — EXPANDABLE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Matches</CardTitle>
                <CardDescription>
                  Click a job to expand its detailed AI feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topMatches.map((m, i) => (
                  <ExpandableMatchRow
                    key={m.match_id}
                    match={m}
                    rank={i + 1}
                    highlightTerm={highlightTerm}
                  />
                ))}
              </CardContent>
            </Card>


            {/* Match Landscape */}
            <MatchLandscapeCard scores={scores} />


            {/* Companies in Pool */}
            <CompaniesCard scores={scores} />
          </TabsContent>


          {/* ══════════════════ TAB 2: ALL JOBS ══════════════════ */}
          <TabsContent value="per-job">
            <PerJobList scores={scores} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════


function MetricCard({
  label, value, hint, tone, icon: Icon,
}: {
  label: string; value: number | string; hint: string; tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={cn("font-mono text-3xl font-semibold tabular-nums", tone)}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}


// ─────────── CHARTS ───────────


function RadarCard({ data }: { data: { dim: string; value: number }[] }) {
  return (
    <Card className="border-border/80 shadow-sm ring-1 ring-white/5">
      <CardHeader>
        <CardTitle className="text-base">Competency Radar</CardTitle>
        <CardDescription>Average scores across dimensions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} outerRadius="75%">
            <defs>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.15} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="var(--border)" strokeDasharray="2 4" />
            <PolarAngleAxis
              dataKey="dim"
              tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 9, opacity: 0.4 }}
              axisLine={false} tickLine={false} tickCount={3} angle={90}
            />
            <Radar
              dataKey="value" stroke="var(--primary)" strokeWidth={2}
              fill="url(#radarFill)"
              dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
              isAnimationActive
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 12,
              }}
              formatter={(v: any) => [`${v}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


function DistributionCard({
  data,
}: {
  data: { name: string; count: number; color: string; fill: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Score Distribution</CardTitle>
        <CardDescription>How this candidate ranks per job</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 30 }}>
            <defs>
              {data.map((d, i) => (
                <linearGradient key={i} id={`barFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={d.color} stopOpacity={0.55} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              interval={0} angle={-12} textAnchor="end" height={60}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              allowDecimals={false} axisLine={false} tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 12,
              }}
              formatter={(v: any) => [`${v} job${v === 1 ? "" : "s"}`, "Count"]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={70}>
              <LabelList
                dataKey="count" position="top"
                fill="var(--foreground)" fontSize={12} fontWeight={600}
                formatter={(v: any) => (v > 0 ? v : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


// ─────────── MATCH LANDSCAPE ───────────


function MatchLandscapeCard({ scores }: { scores: MatchResult[] }) {
  const data = useMemo(
    () =>
      [...scores]
        .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))
        .map((s, i) => ({
          rank: i + 1,
          score: Math.round(s.total_score ?? 0),
          label: s.job_title || "Untitled",
          company: s.job_company || "—",
          matchId: s.match_id,
        })),
    [scores],
  );


  const avg = data.length
    ? Math.round(data.reduce((a, d) => a + d.score, 0) / data.length)
    : 0;


  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Match Landscape</CardTitle>
            <CardDescription>
              Every scored job, sorted high → low
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Avg</span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 font-mono font-semibold tabular-nums",
                scoreBg(avg),
                scoreTone(avg),
              )}
            >
              {avg}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="landscapeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="landscapeStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="rank"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false} axisLine={false}
              ticks={[0, 50, 70, 85, 100]}
            />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeDasharray: "3 3", strokeWidth: 1 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 12,
              }}
              formatter={(v: any) => [`${v}/100`, "Score"]}
              labelFormatter={(_l, p: any) => {
                const it = p?.[0]?.payload;
                return it ? `#${it.rank} · ${it.label} @ ${it.company}` : "";
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="url(#landscapeStroke)"
              strokeWidth={2}
              fill="url(#landscapeFill)"
              dot={{ r: 3, strokeWidth: 0, fill: "var(--primary)" }}
              activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>


        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <LegendDot color="#10b981" label="Excellent 85+" />
          <LegendDot color="#3b82f6" label="Strong 70-84" />
          <LegendDot color="#f59e0b" label="Fair 50-69" />
          <LegendDot color="#ef4444" label="Poor <50" />
        </div>
      </CardContent>
    </Card>
  );
}


function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}


// ─────────── COMPANIES IN POOL ───────────


function CompaniesCard({ scores }: { scores: MatchResult[] }) {
  const companies = useMemo(() => {
    const map = new Map<string, { count: number; totalScore: number; best: number }>();
    scores.forEach((s) => {
      const name = s.job_company?.trim();
      if (!name) return;
      const cur = map.get(name) ?? { count: 0, totalScore: 0, best: 0 };
      const v = s.total_score ?? 0;
      cur.count++;
      cur.totalScore += v;
      cur.best = Math.max(cur.best, v);
      map.set(name, cur);
    });
    return [...map.entries()]
      .map(([name, v]) => ({
        name,
        count: v.count,
        avg: Math.round(v.totalScore / v.count),
        best: Math.round(v.best),
      }))
      .sort((a, b) => b.best - a.best);
  }, [scores]);


  if (companies.length === 0) return null;


  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Companies in Pool</CardTitle>
            <CardDescription>
              Sorted by best score · hover for detail
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 font-mono">
            {companies.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {companies.map((c) => (
            <div
              key={c.name}
              title={`${c.name}\n${c.count} job${c.count === 1 ? "" : "s"} · avg ${c.avg} · best ${c.best}`}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition hover:bg-muted/40",
                scoreBg(c.best),
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background",
                  c.best >= 80
                    ? "bg-emerald-500"
                    : c.best >= 60
                      ? "bg-amber-500"
                      : "bg-muted-foreground",
                )}
              >
                {c.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-foreground/90">{c.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className={cn("font-mono font-semibold tabular-nums", scoreTone(c.best))}>
                {c.best}
              </span>
              {c.count > 1 && (
                <span className="rounded-full bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ×{c.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


// ─────────── EXPANDABLE TOP-MATCH ROW ───────────


function ExpandableMatchRow({
  match, rank, highlightTerm,
}: {
  match: MatchResult;
  rank: number;
  highlightTerm: string | null;
}) {
  const [open, setOpen] = useState(false);
  const score = Math.round(match.total_score ?? 0);
  const ai = match.ai_analysis_details;
  const isHighlighted = !!highlightTerm && matchContainsTerm(match, highlightTerm);
  const isDimmed = !!highlightTerm && !isHighlighted;


  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition",
        isHighlighted && "border-primary/60 ring-2 ring-primary/20 bg-primary/[0.03]",
        isDimmed && "border-border/30 opacity-40",
        !highlightTerm && "border-border/60",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/40"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {match.job_title || "Untitled"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[match.job_company, match.job_location].filter(Boolean).join(" · ") || "—"}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
            <span>Skill {Math.round(match.skill_score ?? 0)}</span>
            <span>Edu {Math.round(match.education_score ?? 0)}</span>
            <span>Work {Math.round(match.work_experience_score ?? 0)}</span>
            <span>Proj {Math.round(match.project_score ?? 0)}</span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-1 font-mono text-sm font-semibold tabular-nums",
            scoreBg(score),
            scoreTone(score),
          )}
        >
          {score}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>


      {open && (
        <div className="border-t bg-muted/20 p-4">
          {!ai ? (
            <p className="text-sm text-muted-foreground">
              No AI analysis stored for this job.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ai.evaluation_summary && (
                <div className="md:col-span-2">
                  <MiniSection icon={Sparkles} label="Evaluation Summary" tone="text-primary">
                    <p className="leading-relaxed">{ai.evaluation_summary}</p>
                  </MiniSection>
                </div>
              )}
              {!!ai.matched_skills?.length && (
                <MiniSection icon={Award} label="Matched Skills" tone="text-emerald-500">
                  <div className="flex flex-wrap gap-1">
                    {ai.matched_skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </MiniSection>
              )}
              {!!ai.gap_analysis?.length && (
                <MiniSection icon={FileWarning} label="Gaps" tone="text-amber-500">
                  <BulletList items={ai.gap_analysis} />
                </MiniSection>
              )}
              {!!ai.actionable_advice?.length && (
                <MiniSection icon={Lightbulb} label="Advice" tone="text-blue-500">
                  <BulletList items={ai.actionable_advice} />
                </MiniSection>
              )}
              {!!ai.project_impact?.length && (
                <MiniSection icon={TrendingUp} label="Project Impact" tone="text-emerald-500">
                  <BulletList items={ai.project_impact} />
                </MiniSection>
              )}
              {!!ai.technical_complexity?.length && (
                <MiniSection icon={Target} label="Technical Complexity" tone="text-purple-500">
                  <BulletList items={ai.technical_complexity} />
                </MiniSection>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function MiniSection({
  icon: Icon, label, tone, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; tone: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-xs">
      <div className={cn("flex items-center gap-1.5 font-semibold uppercase tracking-wide", tone)}>
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-sm text-foreground/85">{children}</div>
    </div>
  );
}


function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-4">
      {items.map((it, i) => (
        <li key={i} className="leading-relaxed">{it}</li>
      ))}
    </ul>
  );
}


// ─────────── PER-JOB TAB LIST ───────────


function PerJobList({ scores }: { scores: MatchResult[] }) {
  const [filter, setFilter] = useState<ScoreBucket>("all");


  const filtered = useMemo(() => {
    const inRange = (v: number) => {
      switch (filter) {
        case "excellent": return v >= 85;
        case "strong":    return v >= 70 && v < 85;
        case "fair":      return v >= 50 && v < 70;
        case "poor":      return v < 50;
        default:          return true;
      }
    };
    return [...scores]
      .filter((s) => inRange(s.total_score ?? 0))
      .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
  }, [scores, filter]);


  const filters: { key: ScoreBucket; label: string }[] = [
    { key: "all", label: `All (${scores.length})` },
    { key: "excellent", label: "Excellent 85+" },
    { key: "strong", label: "Strong 70-84" },
    { key: "fair", label: "Fair 50-69" },
    { key: "poor", label: "Poor <50" },
  ];


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition",
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>


      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No jobs in this bucket.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m, i) => (
            <ExpandableMatchRow
              key={m.match_id}
              match={m}
              rank={i + 1}
              highlightTerm={null}
            />
          ))}
        </div>
      )}
    </div>
  );
}