"use client";

import { type CandidateProfile, parseGithubSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  Sparkles,
  MapPin,
  Calendar,
  Trophy,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GithubInsights } from "./github-insights";
import { normalizeSkills } from "@/lib/utils";

interface CandidateDetailPanelProps {
  candidate: CandidateProfile;
  onClose: () => void;
}

function shortHandle(url?: string): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, "").split("/")[0] || u.hostname;
  } catch {
    return url;
  }
}

const SENIORITY_STYLE: Record<string, string> = {
  junior: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  mid: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  senior:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const ACTIVITY_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  moderate: "bg-amber-500",
  inactive: "bg-gray-400",
};

export function CandidateDetailPanel({
  candidate,
  onClose,
}: CandidateDetailPanelProps) {
  const handle = shortHandle(candidate.github_url);
  const skills = normalizeSkills(candidate.cv_structured?.skills);
  const education = candidate.cv_structured?.education ?? [];
  const work = candidate.cv_structured?.work_experience ?? [];
  const projects = candidate.cv_structured?.project ?? [];
  const additional = candidate.cv_structured?.additional_info ?? [];
  const githubData = parseGithubSummary(candidate.github_summary);

  const gh = githubData?.profile?.profile;
  const summary = githubData?.summary;
  const displayName = gh?.name || gh?.login || handle;
  const displayTitle =
    work[0]?.title || summary?.primary_tech_stack?.join(" · ") || "Candidate";
  const seniority = summary?.seniority_estimate ?? "";
  const activity = summary?.activity_level ?? "";

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-6 pr-4">
        {/* ═══════════════ HERO ═══════════════ */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {gh?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gh.avatar_url}
                  alt={displayName}
                  className="size-20 rounded-2xl border-2 border-background object-cover shadow-lg ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-background bg-gradient-to-br from-primary to-purple-500 text-2xl font-bold text-primary-foreground shadow-lg ring-2 ring-primary/20">
                  {(displayName[0] ?? "?").toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight">
                  {displayName}
                </h2>
                <p className="text-sm text-muted-foreground">{displayTitle}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {seniority && (
                    <Badge
                      variant="outline"
                      className={SENIORITY_STYLE[seniority] ?? ""}
                    >
                      <Zap className="mr-1 size-3" />
                      {seniority.toUpperCase()}
                    </Badge>
                  )}
                  {activity && (
                    <Badge variant="outline" className="gap-1.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          ACTIVITY_DOT[activity] ?? "bg-gray-400"
                        }`}
                      />
                      {activity}
                    </Badge>
                  )}
                  {summary?.open_source_engagement && (
                    <Badge variant="outline">
                      OSS · {summary.open_source_engagement}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Meta row */}
          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {gh?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {gh.location}
              </span>
            )}
            {gh?.followers !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="size-3" /> {gh.followers} followers
              </span>
            )}
            {candidate.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                Joined {new Date(candidate.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="relative mt-4 flex flex-wrap gap-2">
            {candidate.github_url && (
              <a
                href={candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="gap-1.5">
                  <GithubIcon className="size-3.5" /> View GitHub
                </Button>
              </a>
            )}
            {candidate.cv_url && (
              <a
                href={candidate.cv_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileText className="size-3.5" /> View CV
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* ═══════════════ QUICK STATS ═══════════════ */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox
            icon={<Code2 className="size-4" />}
            label="Skills"
            value={skills.length}
            color="text-blue-500"
          />
          <StatBox
            icon={<Briefcase className="size-4" />}
            label="Experience"
            value={work.length}
            color="text-emerald-500"
          />
          <StatBox
            icon={<Sparkles className="size-4" />}
            label="Projects"
            value={projects.length}
            color="text-purple-500"
          />
          <StatBox
            icon={<GraduationCap className="size-4" />}
            label="Education"
            value={education.length}
            color="text-amber-500"
          />
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
          </TabsList>

          {/* ─────────── PROFILE ─────────── */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code2 className="size-4 text-blue-500" />
                  Skills ({skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No skills extracted.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {additional.length > 0 && (
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="size-4 text-amber-500" />
                    Achievements & Extras ({additional.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {additional.map((a, i) => (
                      <div
                        key={i}
                        className="group flex items-start gap-2 rounded-lg border border-border/60 bg-gradient-to-br from-amber-500/5 to-transparent p-3 text-xs leading-relaxed transition-all hover:border-amber-500/40 hover:from-amber-500/10 hover:shadow-sm"
                      >
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500/80 group-hover:text-amber-500" />
                        <span className="text-foreground/90">{a}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary?.strengths && summary.strengths.length > 0 && (
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="size-4 text-emerald-500" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground/90"
                      >
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─────────── EXPERIENCE ─────────── */}
          <TabsContent value="experience" className="mt-4 space-y-4">
            {/* Education */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="size-4 text-amber-500" />
                  Education ({education.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {education.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No education info.
                  </p>
                ) : (
                  <div className="relative space-y-4 pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/30 to-transparent" />
                    {education.map((e, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[18px] top-1.5 size-2.5 rounded-full border-2 border-background bg-amber-500 shadow" />
                        <p className="text-sm font-semibold">
                          {e.degree || "Untitled"}
                        </p>
                        <p className="text-xs text-foreground/80">
                          {e.institution}
                        </p>
                        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                          {e.location && <span>📍 {e.location}</span>}
                          {e.period && <span>🗓 {e.period}</span>}
                          {e.gpa && <span>🎯 GPA {e.gpa}</span>}
                        </p>
                        {e.coursework && (
                          <p className="mt-1.5 rounded-md bg-muted/40 p-2 text-[11px] text-foreground/80">
                            <span className="font-medium">Coursework: </span>
                            {e.coursework}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="size-4 text-emerald-500" />
                  Work Experience ({work.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {work.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No work experience.
                  </p>
                ) : (
                  <div className="relative space-y-5 pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/30 to-transparent" />
                    {work.map((w, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[18px] top-1.5 size-2.5 rounded-full border-2 border-background bg-emerald-500 shadow" />
                        <p className="text-sm font-semibold">
                          {w.title || "Untitled role"}
                        </p>
                        <p className="text-xs text-foreground/80">
                          {w.company}
                        </p>
                        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                          {w.location && <span>📍 {w.location}</span>}
                          {w.period && <span>🗓 {w.period}</span>}
                        </p>
                        {w.achievements && w.achievements.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {w.achievements.map((a, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground/85"
                              >
                                <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-500" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-purple-500" />
                  Projects ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.length === 0 && (
                  <p className="text-xs text-muted-foreground">No projects.</p>
                )}
                {projects.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-gradient-to-br from-purple-500/5 to-transparent p-3 transition-all hover:border-purple-500/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {p.name || "Untitled"}
                      </p>
                      {p.period && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {p.period}
                        </span>
                      )}
                    </div>
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.technologies.map((t, j) => (
                          <Badge
                            key={j}
                            variant="outline"
                            className="border-purple-500/30 bg-purple-500/5 text-[10px] text-purple-600 dark:text-purple-400"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {p.description && p.description.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {p.description.map((d, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground/85"
                          >
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-purple-500" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─────────── GITHUB ─────────── */}
          <TabsContent value="github" className="mt-4">
            {githubData ? (
              <GithubInsights data={githubData} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                <GithubIcon className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No GitHub data available.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/30 to-transparent p-3 transition-all hover:border-primary/40 hover:shadow-md">
      <div className={`mb-1 flex items-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
