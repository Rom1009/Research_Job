"use client";


import * as React from "react";
import { useEffect, useState } from "react";
import {
  X,
  Award,
  Briefcase,
  BarChart3,
  FileText,
  ExternalLink,
  Sparkles,
  Trophy,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, type UserProfile, type MatchResult } from "@/lib/api";
import { GithubIcon } from "@/components/dashboard/brand-icons";


interface DashboardRightPanelProps {
  selectedCandidate: UserProfile | null;
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


function initials(handle: string): string {
  const parts = handle
    .replace(/[-_]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}


export function DashboardRightPanel({
  selectedCandidate,
  onClose,
}: DashboardRightPanelProps) {
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!selectedCandidate) return;
    setLoading(true);
    api
      .getUserScores(selectedCandidate.user_id)
      .then(setScores)
      .catch((e) => console.error("Load scores failed:", e))
      .finally(() => setLoading(false));
  }, [selectedCandidate?.user_id]);


  if (!selectedCandidate) return null;


  const u = selectedCandidate;
  const handle = shortHandle(u.github_url);
  const skills = u.cv_structured?.skills ?? [];
  const education = u.cv_structured?.education ?? [];
  const work = u.cv_structured?.work_experience ?? [];
  const additional = u.cv_structured?.additional_info ?? [];


  const bestScore = scores.reduce(
    (max, s) => Math.max(max, s.total_score ?? 0),
    0,
  );
  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + (s.total_score ?? 0), 0) / scores.length
      : 0;


  // Breakdown lấy từ score có total cao nhất
  const topMatch = scores.reduce<MatchResult | undefined>(
    (best, s) => ((s.total_score ?? 0) > (best?.total_score ?? 0) ? s : best),
    undefined,
  );


  const breakdown = topMatch
    ? {
        skill: topMatch.skill_score ?? 0,
        education: topMatch.education_score ?? 0,
        work_experience: topMatch.work_experience_score ?? 0,
        project: topMatch.project_score ?? 0,
      }
    : null;


  return (
    <div className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-md flex-col border-l border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">Candidate Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>


      <Tabs
        defaultValue="profile"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-4 grid grid-cols-3">
          <TabsTrigger value="profile" className="text-xs">
            Profile
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-xs">
            Experience
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs">
            Analysis
          </TabsTrigger>
        </TabsList>


        {/* PROFILE */}
        <TabsContent value="profile" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold">
                  {initials(handle)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{handle}</h3>
                  {u.created_at && (
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>


              <Separator />


              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Links</p>
                <div className="flex flex-wrap gap-2">
                  {u.github_url && (
                    <a
                      href={u.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs hover:bg-muted"
                    >
                      <GithubIcon className="size-3.5" />
                      GitHub
                    </a>
                  )}
                  {u.cv_url && (
                    <a
                      href={u.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" />
                      CV source
                    </a>
                  )}
                </div>
              </div>


              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Skills ({skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No skills extracted
                    </span>
                  )}
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>


              {u.created_at && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Ingested</p>
                  <p className="text-sm">
                    {new Date(u.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>


        {/* EXPERIENCE */}
        <TabsContent value="experience" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              <section>
                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                  <Award className="h-4 w-4" />
                  Education ({education.length})
                </h4>
                <div className="space-y-2">
                  {education.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No education info.
                    </p>
                  )}
                  {education.map((e, i) => (
                    <div
                      key={i}
                      className="rounded-md border p-3 text-sm space-y-1"
                    >
                      <p className="font-medium">
                        {[e.degree, e.institution]
                          .filter(Boolean)
                          .join(" @ ") || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[e.location, e.period, e.gpa && `GPA ${e.gpa}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {e.coursework && (
                        <p className="text-xs text-foreground/80">
                          <span className="font-medium">Coursework: </span>
                          {e.coursework}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>


              <Separator />


              <section>
                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                  <Briefcase className="h-4 w-4" />
                  Work Experience ({work.length})
                </h4>
                <div className="space-y-2">
                  {work.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No work experience.
                    </p>
                  )}
                  {/* Work Experience */}
                  {work.map((w, i) => (
                    <div
                      key={i}
                      className="rounded-md border p-3 text-sm space-y-1"
                    >
                      <p className="font-medium">
                        {[w.title, w.company].filter(Boolean).join(" @ ") ||
                          "Untitled role"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[w.location, w.period].filter(Boolean).join(" · ")}
                      </p>
                      {w.achievements && w.achievements.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-foreground/80">
                          {w.achievements.map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>


              {additional.length > 0 && (
                <>
                  <Separator />
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 font-semibold">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Achievements & Extras ({additional.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {additional.map((a, i) => (
                        <div
                          key={i}
                          className="group flex items-start gap-2 rounded-lg border border-border/60 bg-gradient-to-br from-muted/40 to-transparent p-3 text-xs leading-relaxed transition-colors hover:border-amber-500/40 hover:from-amber-500/5"
                        >
                          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500/80 group-hover:text-amber-500" />
                          <span className="text-foreground/90">{a}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>


        {/* ANALYSIS */}
        <TabsContent value="analysis" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : scores.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  No scores yet. Run scoring from the Jobs page.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Best match
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(bestScore)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Avg ({scores.length})
                        </p>
                        <p className="text-2xl font-bold text-blue-500">
                          {Math.round(avgScore)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>


                  {breakdown && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <BarChart3 className="h-4 w-4" />
                        Top match breakdown
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(breakdown).map(([key, value]) => (
                          <div key={key}>
                            <div className="mb-1 flex items-center justify-between">
                              <p className="text-sm font-medium capitalize">
                                {key.replace("_", " ")}
                              </p>
                              <p className="text-sm font-semibold">
                                {Math.round(value)}
                              </p>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {topMatch?.ai_analysis_details && (
                    <>
                      <Separator />
                      {/* Evaluation Summary */}
                      {topMatch.ai_analysis_details.evaluation_summary && (
                        <section>
                          <h4 className="mb-2 flex items-center gap-2 font-semibold">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Evaluation
                          </h4>
                          <div className="relative rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 p-4">
                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-primary to-blue-500" />
                            <p className="pl-2 text-sm leading-relaxed text-foreground/90">
                              {topMatch.ai_analysis_details.evaluation_summary}
                            </p>
                          </div>
                        </section>
                      )}


                      {/* Gap Analysis */}
                      {topMatch.ai_analysis_details.gap_analysis &&
                        topMatch.ai_analysis_details.gap_analysis.length >
                          0 && (
                          <section>
                            <h4 className="mb-2 flex items-center gap-2 font-semibold">
                              <TriangleAlert className="h-4 w-4 text-amber-500" />
                              Gap Analysis
                              <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                {
                                  topMatch.ai_analysis_details.gap_analysis
                                    .length
                                }
                              </span>
                            </h4>
                            <ul className="space-y-2">
                              {topMatch.ai_analysis_details.gap_analysis.map(
                                (g, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs leading-relaxed"
                                  >
                                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      {i + 1}
                                    </span>
                                    <span className="text-foreground/90">
                                      {g}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </section>
                        )}


                      {/* Actionable Advice */}
                      {topMatch.ai_analysis_details.actionable_advice &&
                        topMatch.ai_analysis_details.actionable_advice.length >
                          0 && (
                          <section>
                            <h4 className="mb-2 flex items-center gap-2 font-semibold">
                              <Lightbulb className="h-4 w-4 text-emerald-500" />
                              Actionable Advice
                              <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {
                                  topMatch.ai_analysis_details.actionable_advice
                                    .length
                                }
                              </span>
                            </h4>
                            <ul className="space-y-2">
                              {topMatch.ai_analysis_details.actionable_advice.map(
                                (a, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs leading-relaxed"
                                  >
                                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                    <span className="text-foreground/90">
                                      {a}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </section>
                        )}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}





