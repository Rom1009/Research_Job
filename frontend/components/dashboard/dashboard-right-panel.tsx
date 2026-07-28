"use client";
import Link from "next/link";
import { useEffect } from "react";
import {
  X,
  Maximize2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Code2,
  MapPin,
  Users,
  Calendar,
  Zap,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type CandidateProfile, parseGithubSummary } from "@/lib/api";
import { GithubIcon } from "@/components/dashboard/brand-icons";
import { normalizeSkills } from "@/lib/utils";

interface DashboardRightPanelProps {
  selectedCandidate: CandidateProfile | null;
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

const MAX_SKILLS_PREVIEW = 8;

export function DashboardRightPanel({
  selectedCandidate,
  onClose,
}: DashboardRightPanelProps) {
  if (!selectedCandidate) return null;

  const u = selectedCandidate;
  const handle = shortHandle(u.github_url);
  const skills = normalizeSkills(u.cv_structured?.skills);
  const education = u.cv_structured?.education ?? [];
  const work = u.cv_structured?.work_experience ?? [];
  const project = u.cv_structured?.project ?? [];
  const githubData = parseGithubSummary(u.github_summary);

  const gh = githubData?.profile?.profile;
  const summary = githubData?.summary;
  const displayName = gh?.name || gh?.login || handle;
  const displayTitle =
    work[0]?.title ||
    summary?.primary_tech_stack?.slice(0, 3).join(" · ") ||
    "Candidate";
  const seniority = summary?.seniority_estimate ?? "";
  const activity = summary?.activity_level ?? "";

  const detailHref = `/dashboard/candidates/${u.candidate_id}`;
  const shownSkills = skills.slice(0, MAX_SKILLS_PREVIEW);
  const hiddenSkillsCount = Math.max(0, skills.length - MAX_SKILLS_PREVIEW);

  // bên trong component, sau khi khai báo biến:
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Preview
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {/* ═════ HERO ═════ */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
              <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-6 size-28 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative flex items-start gap-3">
                {gh?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gh.avatar_url}
                    alt={displayName}
                    className="size-14 rounded-xl border-2 border-background object-cover shadow-md ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-xl border-2 border-background bg-gradient-to-br from-primary to-purple-500 text-lg font-bold text-primary-foreground shadow-md ring-2 ring-primary/20">
                    {(displayName[0] ?? "?").toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold">
                    {displayName}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {displayTitle}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {seniority && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${SENIORITY_STYLE[seniority] ?? ""}`}
                      >
                        <Zap className="mr-0.5 size-2.5" />
                        {seniority.toUpperCase()}
                      </Badge>
                    )}
                    {activity && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <span
                          className={`size-1.5 rounded-full ${
                            ACTIVITY_DOT[activity] ?? "bg-gray-400"
                          }`}
                        />
                        {activity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {gh?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {gh.location}
                  </span>
                )}
                {gh?.followers !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {gh.followers}
                  </span>
                )}
                {u.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* ═════ QUICK STATS ═════ */}
            <div className="grid grid-cols-4 gap-2">
              <MiniStat
                icon={<Code2 className="size-3" />}
                value={skills.length}
                label="Skills"
                color="text-blue-500"
              />
              <MiniStat
                icon={<Briefcase className="size-3" />}
                value={work.length}
                label="Work"
                color="text-emerald-500"
              />
              <MiniStat
                icon={<Sparkles className="size-3" />}
                value={project.length}
                label="Proj"
                color="text-purple-500"
              />
              <MiniStat
                icon={<GraduationCap className="size-3" />}
                value={education.length}
                label="Edu"
                color="text-amber-500"
              />
            </div>

            {/* ═════ SKILLS PREVIEW ═════ */}
            {skills.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Top Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {shownSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                  {hiddenSkillsCount > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{hiddenSkillsCount} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* ═════ QUICK LINKS ═════ */}
            <div className="flex flex-wrap gap-1.5">
              {u.github_url && (
                <a
                  href={u.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                  >
                    <GithubIcon className="size-3" /> GitHub
                  </Button>
                </a>
              )}
              {u.cv_url && (
                <a href={u.cv_url} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                  >
                    <FileText className="size-3" /> CV
                  </Button>
                </a>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* ═════ FOOTER CTA ═════ */}
        <div className="border-t border-border bg-gradient-to-br from-primary/5 to-transparent p-3">
          <Link href={detailHref} className="block">
            <Button className="group h-11 w-full gap-2 text-sm font-semibold shadow-md">
              <Maximize2 className="size-4" />
              Open Full Profile
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Full experience, projects, and GitHub insights
          </p>
        </div>
      </div>
    </>
  );
}

function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-transparent p-2 text-center">
      <div className={`flex items-center justify-center gap-1 ${color}`}>
        {icon}
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
