"use client";


import * as React from "react";
import { useEffect, useState } from "react";
import { Search, ArrowUpDown, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/dashboard/brand-icons";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { api, type UserProfile, type MatchResult } from "@/lib/api";


type SortKey = "created_at" | "skills" | "score";


interface CandidatesTableProps {
  onSelectCandidate?: (user: UserProfile) => void;
}


function extractGithubHandle(url?: string): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, "").split("/")[0] || u.hostname;
  } catch {
    return url;
  }
}


function initialsFromHandle(handle: string): string {
  const clean = handle.replace(/[-_]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}


export function CandidatesTable({
  onSelectCandidate,
}: CandidatesTableProps = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();


  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");


  const [scores, setScores] = useState<Record<string, number>>({});
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());


  function toggleSkillsExpanded(userId: string) {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listUsers()
      .then(async (data) => {
        if (cancelled) return;
        setUsers(data);
        // fetch scores parallel
        const allScores = await Promise.all(
          data.map((u) =>
            api.getUserScores(u.user_id).catch(() => [] as MatchResult[]),
          ),
        );
        if (cancelled) return;
        const map: Record<string, number> = {};
        allScores.forEach((list, i) => {
          const best = list.reduce(
            (m, s) => Math.max(m, s.total_score ?? 0),
            0,
          );
          if (best > 0) map[data[i].user_id] = best;
        });
        setScores(map);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);


  const rows = React.useMemo(() => {
    let out = [...users];


    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((u) => {
        const handle = extractGithubHandle(u.github_url).toLowerCase();
        const skills = (u.cv_structured?.skills ?? []).map((s) =>
          s.toLowerCase(),
        );
        return (
          handle.includes(q) ||
          u.user_id.toLowerCase().includes(q) ||
          skills.some((s) => s.includes(q))
        );
      });
    }


    out.sort((a, b) => {
      let av = 0,
        bv = 0;
      if (sortKey === "skills") {
        av = a.cv_structured?.skills?.length ?? 0;
        bv = b.cv_structured?.skills?.length ?? 0;
      } else if (sortKey === "score") {
        av = scores[a.user_id] ?? -1;
        bv = scores[b.user_id] ?? -1;
      } else {
        av = a.created_at ? new Date(a.created_at).getTime() : 0;
        bv = b.created_at ? new Date(b.created_at).getTime() : 0;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });


    return out;
  }, [users, query, sortKey, sortDir]);


  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Candidate Rankings</CardTitle>
            <CardDescription>
              Profiles ingested from CV uploads and GitHub summaries.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search github or skill…"
                className="w-full pl-9 sm:w-56"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>


      <CardContent>
        {error && (
          <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}


        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            No candidates yet. Upload a CV to ingest the first profile.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden md:table-cell">
                      <SortButton
                        label="Skills"
                        active={sortKey === "skills"}
                        dir={sortDir}
                        onClick={() => toggleSort("skills")}
                      />
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Education
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Experience
                    </TableHead>
                    <TableHead>
                      <SortButton
                        label="Created"
                        active={sortKey === "created_at"}
                        dir={sortDir}
                        onClick={() => toggleSort("created_at")}
                      />
                    </TableHead>
                    <TableHead className="text-right">Links</TableHead>
                    <TableHead>
                      <SortButton
                        label="AI Score"
                        active={sortKey === "score"}
                        dir={sortDir}
                        onClick={() => toggleSort("score")}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody>
                  {rows.map((u) => {
                    const handle = extractGithubHandle(u.github_url);
                    const initials = initialsFromHandle(handle);
                    const skills = u.cv_structured?.skills ?? [];
                    const education = u.cv_structured?.education ?? [];
                    const work = u.cv_structured?.work_experience ?? [];
                    const isExpanded = expandedSkills.has(u.user_id);
                    const visibleSkills = isExpanded
                      ? skills
                      : skills.slice(0, 2);


                    return (
                      <TableRow
                        key={u.user_id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => onSelectCandidate?.(u)}
                      >
                        {/* ── Candidate ── */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-secondary text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{handle}</span>
                          </div>
                        </TableCell>


                        {/* ── Skills (ngắn + expand) ── */}
                        <TableCell className="hidden md:table-cell max-w-[260px]">
                          {skills.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1">
                              {visibleSkills.map((s) => (
                                <Badge
                                  key={s}
                                  variant="secondary"
                                  className="max-w-[220px] truncate"
                                  title={s}
                                >
                                  {s}
                                </Badge>
                              ))}
                              {skills.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSkillsExpanded(u.user_id);
                                  }}
                                >
                                  {isExpanded
                                    ? "Show less"
                                    : `+${skills.length - 2} more`}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>


                        {/* ── Education ── */}
                        <TableCell className="hidden sm:table-cell max-w-[220px]">
                          {education.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className="block truncate text-xs text-foreground/90" />
                                }
                              >
                                {[
                                  education[0]?.degree,
                                  education[0]?.institution,
                                ]
                                  .filter(Boolean)
                                  .join(" @ ")}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <ul className="list-disc pl-4 text-xs">
                                  {education.map((e, i) => (
                                    <li key={i}>
                                      {[e.degree, e.institution, e.period]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>


                        {/* ── Experience ── */}
                        <TableCell className="hidden lg:table-cell max-w-[240px]">
                          {work.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className="block truncate text-xs text-foreground/90" />
                                }
                              >
                                {[work[0]?.title, work[0]?.company]
                                  .filter(Boolean)
                                  .join(" @ ")}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <ul className="list-disc pl-4 text-xs">
                                  {work.map((w, i) => (
                                    <li key={i}>
                                      {[w.title, w.company, w.period]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>


                        {/* ── Created ── */}
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString()
                              : "—"}
                          </span>
                        </TableCell>


                        {/* ── Links ── */}
                        <TableCell className="text-right">
                          {u.github_url ? (
                            <a
                              href={u.github_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Open GitHub"
                            >
                              <GithubIcon className="size-4" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                          {u.cv_url && (
                            <a
                              href={u.cv_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Open CV"
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          )}
                        </TableCell>


                        {/* ── AI Score ── */}
                        <TableCell>
                          {scores[u.user_id] != null ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
                                scores[u.user_id] >= 80 &&
                                  "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
                                scores[u.user_id] >= 60 &&
                                  scores[u.user_id] < 80 &&
                                  "bg-amber-500/15 text-amber-500 border-amber-500/30",
                                scores[u.user_id] < 60 &&
                                  "bg-muted text-muted-foreground border-transparent",
                              )}
                            >
                              {Math.round(scores[u.user_id])}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>


            <p className="mt-3 text-xs text-muted-foreground">
              Showing {rows.length} of {users.length} candidates
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}


function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <ArrowUpDown
        className={cn("size-3", active && dir === "asc" && "rotate-180")}
      />
    </button>
  );
}