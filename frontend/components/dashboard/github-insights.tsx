"use client";

import { GithubProfileData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ExternalLink,
  GitCommit,
  GitPullRequest,
  GitBranch,
  Star,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Activity,
  Code2,
} from "lucide-react";

interface Props {
  data: GithubProfileData;
}

const LANG_COLORS: Record<string, string> = {
  Python: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  TypeScript: "bg-sky-500",
  HTML: "bg-orange-500",
  CSS: "bg-purple-500",
  "Jupyter Notebook": "bg-orange-400",
  Java: "bg-red-500",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  "C#": "bg-green-600",
  Go: "bg-cyan-500",
  Rust: "bg-orange-700",
  Cython: "bg-yellow-700",
};

export function GithubInsights({ data }: Props) {
  const { profile, summary } = data;
  const c = profile.contributions;

  return (
    <div className="space-y-4">
      {/* ═════ CONTRIBUTIONS ═════ */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-indigo-500" />
            Contribution Stats{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (last year)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ContribStat
              icon={<GitCommit className="size-4" />}
              label="Commits"
              value={c.total_commits}
              color="text-emerald-500"
              bg="from-emerald-500/10"
            />
            <ContribStat
              icon={<GitPullRequest className="size-4" />}
              label="Pull Requests"
              value={c.total_prs}
              color="text-purple-500"
              bg="from-purple-500/10"
            />
            <ContribStat
              icon={<GitBranch className="size-4" />}
              label="Repos"
              value={c.total_repos_contributed}
              color="text-blue-500"
              bg="from-blue-500/10"
            />
            <ContribStat
              icon={<Activity className="size-4" />}
              label="Calendar"
              value={c.calendar_total}
              color="text-amber-500"
              bg="from-amber-500/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* ═════ TECH STACK & DOMAINS ═════ */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-cyan-500" />
            Tech Stack & Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.primary_tech_stack.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Primary stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.primary_tech_stack.map((t) => (
                  <Badge
                    key={t}
                    className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                    variant="outline"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {summary.domains.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Domains
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.domains.map((d) => (
                  <Badge key={d} variant="outline">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═════ TOP LANGUAGES ═════ */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-rose-500" />
            Top Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {profile.top_languages.slice(0, 6).map((lang) => (
            <div key={lang.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span
                    className={`size-2 rounded-full ${LANG_COLORS[lang.name] ?? "bg-gray-400"}`}
                  />
                  {lang.name}
                </span>
                <span className="text-muted-foreground">
                  {lang.percent.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${LANG_COLORS[lang.name] ?? "bg-gray-400"}`}
                  style={{ width: `${lang.percent}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═════ NOTABLE PROJECTS ═════ */}
      {summary.notable_projects.length > 0 && (
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-purple-500" />
              Notable Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {summary.notable_projects.map((np) => {
              const repo = profile.top_repos.find((r) => r.name === np.name);
              return (
                <a
                  key={np.name}
                  href={
                    repo?.url ??
                    `https://github.com/${profile.profile.login}/${np.name}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-lg border bg-gradient-to-br from-purple-500/5 to-transparent p-3 transition-all hover:border-purple-500/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold group-hover:text-purple-500">
                        {np.name}
                      </span>
                      <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {repo && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {repo.primary_language && (
                          <span className="flex items-center gap-1">
                            <span
                              className={`size-1.5 rounded-full ${LANG_COLORS[repo.primary_language] ?? "bg-gray-400"}`}
                            />
                            {repo.primary_language}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3" /> {repo.stars}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {np.why}
                  </p>
                </a>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ═════ TOP CONTRIBUTED REPOS ═════ */}
      {c.top_contributed_repos.length > 0 && (
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="size-4 text-orange-500" />
              Top Contributed Repos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {c.top_contributed_repos.slice(0, 6).map((r) => (
              <a
                key={r.full_name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${LANG_COLORS[r.language ?? ""] ?? "bg-gray-400"}`}
                  />
                  <span className="truncate text-xs font-medium">
                    {r.full_name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <GitCommit className="size-3" /> {r.commits}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Star className="size-3" /> {r.stars}
                  </span>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ═════ STRENGTHS & RED FLAGS ═════ */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {summary.strengths.length > 0 && (
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-500" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {summary.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground/85"
                  >
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {summary.red_flags.length > 0 && (
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-red-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="size-4 text-amber-500" /> Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {summary.red_flags.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground/85"
                  >
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═════ SENIORITY REASONING ═════ */}
      {summary.seniority_reasoning && (
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Why{" "}
              <span className="text-primary">{summary.seniority_estimate}</span>
              ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border-l-2 border-primary/40 bg-muted/30 p-3 text-xs italic leading-relaxed text-muted-foreground">
              {summary.seniority_reasoning}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContribStat({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br ${bg} to-transparent p-3 text-center`}
    >
      <div className={`mb-1 flex items-center justify-center gap-1 ${color}`}>
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
