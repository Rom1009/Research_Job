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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api, type UserProfile, type MatchResult } from "@/lib/api";
import { useDashboardStore } from "@/lib/dashboard-store";


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


export function AIAnalysisReport() {
  const activeProfileId = useDashboardStore((s) => s.activeProfileId);
  const setActiveProfileId = useDashboardStore((s) => s.setActiveProfileId);


  const [users, setUsers] = useState<UserProfile[]>([]);
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);


  // Load user list
  useEffect(() => {
    let cancelled = false;
    api
      .listUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        // auto-select first if none active
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


  // Load scores for active profile
  useEffect(() => {
    if (!activeProfileId) {
      setScores([]);
      return;
    }
    setLoadingScores(true);
    api
      .getUserScores(activeProfileId)
      .then(setScores)
      .catch(console.error)
      .finally(() => setLoadingScores(false));
  }, [activeProfileId]);


  const currentUser = users.find((u) => u.user_id === activeProfileId);


  // Aggregate metrics
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


  const bestMatch = topMatches[0];
  const ai = bestMatch?.ai_analysis_details;


  const distribution = useMemo(() => {
    const buckets = [
      { name: "Excellent (85+)", min: 85, count: 0, color: "#10b981" },
      { name: "Strong (70-84)", min: 70, count: 0, color: "#3b82f6" },
      { name: "Fair (50-69)", min: 50, count: 0, color: "#f59e0b" },
      { name: "Poor (<50)", min: 0, count: 0, color: "#ef4444" },
    ];
    scores.forEach((s) => {
      const v = s.total_score ?? 0;
      const b =
        v >= 85
          ? buckets[0]
          : v >= 70
            ? buckets[1]
            : v >= 50
              ? buckets[2]
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
      {/* Header + profile selector */}
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
        <>
          {/* Radar + Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm ring-1 ring-white/5">
              <CardHeader>
                <CardTitle className="text-base">Competency Radar</CardTitle>
                <CardDescription>
                  Average scores across dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} outerRadius="75%">
                    <defs>
                      <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                        <stop
                          offset="0%"
                          stopColor="var(--primary)"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--primary)"
                          stopOpacity={0.15}
                        />
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
                      fill="url(#radarFill)"
                      dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "var(--primary)" }}
                      isAnimationActive
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: any) => [`${v}/100`, "Score"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score Distribution</CardTitle>
                <CardDescription>
                  How this candidate ranks per job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={distribution}
                    margin={{ top: 20, right: 10, left: -10, bottom: 30 }}
                  >
                    <defs>
                      {distribution.map((d, i) => (
                        <linearGradient
                          key={i}
                          id={`barFill-${i}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={d.color}
                            stopOpacity={0.95}
                          />
                          <stop
                            offset="100%"
                            stopColor={d.color}
                            stopOpacity={0.55}
                          />
                        </linearGradient>
                      ))}
                    </defs>


                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      interval={0}
                      angle={-12}
                      textAnchor="end"
                      height={60}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: any) => [
                        `${v} job${v === 1 ? "" : "s"}`,
                        "Count",
                      ]}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={70}>
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
              </CardContent>
            </Card>
          </div>


          {/* Top matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5 Matches</CardTitle>
              <CardDescription>
                Highest-scoring jobs for this profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {topMatches.map((m, i) => {
                  const title = m.job_title?.trim() || "Untitled role";
                  const meta = [m.job_company, m.job_location]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li
                      key={m.match_id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{title}</p>
                        {meta && (
                          <p className="truncate text-xs text-muted-foreground">
                            {meta}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span>Skill {Math.round(m.skill_score ?? 0)}</span>
                          <span>·</span>
                          <span>Edu {Math.round(m.education_score ?? 0)}</span>
                          <span>·</span>
                          <span>
                            Work {Math.round(m.work_experience_score ?? 0)}
                          </span>
                          <span>·</span>
                          <span>Proj {Math.round(m.project_score ?? 0)}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-1 font-mono text-sm font-semibold tabular-nums",
                          scoreBg(m.total_score ?? 0),
                          scoreTone(m.total_score ?? 0),
                        )}
                      >
                        {Math.round(m.total_score ?? 0)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>


          {/* AI narrative — from best match */}
          {ai && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {ai.evaluation_summary && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="size-4 text-primary" />
                      Evaluation Summary
                    </CardTitle>
                    <CardDescription>
                      Recruiter perspective from best match
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {ai.evaluation_summary}
                    </p>
                  </CardContent>
                </Card>
              )}


              {ai.gap_analysis && ai.gap_analysis.length > 0 && (
                <NarrativeCard
                  title="Gap Analysis"
                  description="Missing requirements from best match"
                  icon={FileWarning}
                  tone="amber"
                  items={ai.gap_analysis}
                />
              )}


              {ai.actionable_advice && ai.actionable_advice.length > 0 && (
                <NarrativeCard
                  title="Actionable Advice"
                  description="Recommendations to improve fit"
                  icon={Lightbulb}
                  tone="blue"
                  items={ai.actionable_advice}
                />
              )}


              {ai.project_impact && ai.project_impact.length > 0 && (
                <NarrativeCard
                  title="Project Impact"
                  description="Evidence of engineering outcomes"
                  icon={TrendingUp}
                  tone="emerald"
                  items={ai.project_impact}
                />
              )}


              {ai.technical_complexity &&
                ai.technical_complexity.length > 0 && (
                  <NarrativeCard
                    title="Technical Complexity"
                    description="Depth of engineering work"
                    icon={Target}
                    tone="purple"
                    items={ai.technical_complexity}
                  />
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ─────────────────── SUB-COMPONENTS ───────────────────


function MetricCard({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span
            className={cn(
              "font-mono text-3xl font-semibold tabular-nums",
              tone,
            )}
          >
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


const TONE_MAP: Record<string, string> = {
  amber:
    "border-amber-500/30 bg-amber-500/5 [&_.icon-bg]:bg-amber-500/15 [&_.icon-bg]:text-amber-500",
  blue: "border-blue-500/30 bg-blue-500/5 [&_.icon-bg]:bg-blue-500/15 [&_.icon-bg]:text-blue-500",
  emerald:
    "border-emerald-500/30 bg-emerald-500/5 [&_.icon-bg]:bg-emerald-500/15 [&_.icon-bg]:text-emerald-500",
  purple:
    "border-purple-500/30 bg-purple-500/5 [&_.icon-bg]:bg-purple-500/15 [&_.icon-bg]:text-purple-500",
};


function NarrativeCard({
  title,
  description,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_MAP | string;
  items: string[];
}) {
  return (
    <Card className={cn(TONE_MAP[tone])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="icon-bg flex size-7 items-center justify-center rounded-md">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-52">
          <ul className="flex flex-col gap-2 pr-3">
            {items.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40" />
                <span className="text-foreground/90">{it}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}





