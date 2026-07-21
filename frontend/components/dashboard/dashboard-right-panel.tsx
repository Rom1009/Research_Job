"use client";
import {
  X,
  Award,
  Briefcase,
  ExternalLink,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type UserProfile } from "@/lib/api";
import { GithubIcon } from "@/components/dashboard/brand-icons";
import Link from "next/link";


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
  if (!selectedCandidate) return null;


  const u = selectedCandidate;
  const handle = shortHandle(u.github_url);
  const skills = u.cv_structured?.skills ?? [];
  const education = u.cv_structured?.education ?? [];
  const work = u.cv_structured?.work_experience ?? [];
  const project = u.cv_structured?.project ?? [];
  const additional = u.cv_structured?.additional_info ?? [];


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
        <TabsList className="mx-4 mt-4 grid grid-cols-2">
          <TabsTrigger value="profile" className="text-xs">
            Profile
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-xs">
            Experience
          </TabsTrigger>
        </TabsList>


        {/* ══════════════════ PROFILE ══════════════════ */}
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


              {/* CTA — hướng dẫn tới trang AI Analysis đúng nghĩa */}
              <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        Looking for per-job AI analysis?
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Match scoring, gaps, and advice are computed per job.
                      </p>
                    </div>
                    <Link href="/dashboard/ai-analysis" onClick={onClose}>
                      <Button size="sm" variant="outline">
                        Open AI Analysis →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>


        {/* ══════════════════ EXPERIENCE ══════════════════ */}
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
                      className="space-y-1 rounded-md border p-3 text-sm"
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
                  {work.map((w, i) => (
                    <div
                      key={i}
                      className="space-y-1 rounded-md border p-3 text-sm"
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

              <section>
                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                  <Briefcase className="h-4 w-4" />
                  Projects ({project.length})
                </h4>
                <div className="space-y-2">
                  {project.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No projects.
                    </p>
                  )}
                  {project.map((p, i) => (
                    <div
                      key={i}
                      className="space-y-1 rounded-md border p-3 text-sm"
                    >
                      <p className="font-medium">
                        {[p.name].filter(Boolean).join(" @ ") ||
                          "Untitled role"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[p.period].filter(Boolean).join(" · ")}
                      </p>
                      {p.technologies && p.technologies.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-foreground/80">
                          {p.technologies.map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      )}
                      {p.description && p.description.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-foreground/80">
                          {p.description.map((a, j) => (
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
      </Tabs>
    </div>
  );
}



