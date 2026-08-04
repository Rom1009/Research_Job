"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { JobActions } from "./job-actions";
import {
  Check,
  Search,
  MapPin,
  Sparkles,
  Briefcase,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import CountUp from "react-countup";
import { LinkedinIcon } from "@/components/dashboard/brand-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { api, jobApi } from "@/lib/api";
import { useDashboardStore } from "@/lib/dashboard-store";
import { useMyProfile } from "@/hooks/use-my-profile";
import { EmptyState } from "@/components/ui/empty-state";
import { JobFilterBar, DEFAULT_FILTER, applyFilter } from "./job-filter-bar";

type Source = "linkedin" | "glassdoor" | "indeed";

const SOURCES: { value: Source; label: string; disabled?: boolean }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "glassdoor", label: "Glassdoor (coming soon)", disabled: true },
  { value: "indeed", label: "Indeed (coming soon)", disabled: true },
];

const LEVELS = [
  { value: "1", label: "Internship" },
  { value: "2", label: "Entry" },
  { value: "3", label: "Associate" },
  { value: "4", label: "Mid-Senior" },
  { value: "5", label: "Director" },
  { value: "6", label: "Executive" },
];

export function JobScraping() {
  const { source, keywords, location, levels, page, jobs, scores } =
    useDashboardStore((s) => s.jobScraping);
  const setJobScraping = useDashboardStore((s) => s.setJobScraping);
  const scoringInProgress = useDashboardStore(
    (s) => s.jobScraping.scoringInProgress,
  );
  const scoringStartedAt = useDashboardStore(
    (s) => s.jobScraping.scoringStartedAt,
  );
  const { profile } = useMyProfile();
  const profileId = profile?.candidate_id;

  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const setSource = (v: Source) => setJobScraping({ source: v });
  const setKeywords = (v: string) => setJobScraping({ keywords: v });
  const setLocation = (v: string) => setJobScraping({ location: v });
  const setPage = (v: number) => setJobScraping({ page: v });

  // ─── Sync jobs từ backend khi mount ───
  useEffect(() => {
    jobApi
      .list()
      .then((data) => {
        const dbIds = new Set(data.map((j) => j.job_id));
        setJobScraping({
          jobs: data,
          scores: Object.fromEntries(
            Object.entries(scores).filter(([id]) => dbIds.has(id)),
          ),
        });
      })
      .catch((e) => console.warn("Sync jobs failed:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load hidden actions từ backend khi mount ───
  useEffect(() => {
    jobApi
      .listActions?.()
      .then((actions) => {
        const hidden = new Set(
          actions.filter((a) => a.hidden).map((a) => a.job_id),
        );
        setHiddenIds(hidden);
      })
      .catch(() => {});
  }, []);

  // ─── Auto-resume scoring nếu bị interrupt ───
  useEffect(() => {
    if (!scoringInProgress || scoring) return;
    const age = Date.now() - (scoringStartedAt ?? 0);
    if (age > 10 * 60 * 1000) {
      setJobScraping({ scoringInProgress: false, scoringStartedAt: undefined });
      return;
    }
    onScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Filter + sort (loại hidden trước) ───
  const filtered = useMemo(() => {
    const visible = jobs.filter((j) => !hiddenIds.has(j.job_id));
    return applyFilter(visible, scores, filter);
  }, [jobs, scores, filter, hiddenIds]);

  function toggleLevel(v: string) {
    setJobScraping({
      levels: levels.includes(v)
        ? levels.filter((x) => x !== v)
        : [...levels, v],
    });
  }

  async function unhideAll() {
    const ids = Array.from(hiddenIds);
    setHiddenIds(new Set());
    try {
      await Promise.all(
        ids.map((id) => jobApi.updateAction(id, { hidden: false })),
      );
    } catch (e) {
      console.warn("Failed to unhide some jobs:", e);
    }
    toast.success(`Restored ${ids.length} job${ids.length !== 1 ? "s" : ""}`);
  }

  async function onClearAll() {
    if (
      !confirm(
        `Delete all ${jobs.length} scraped jobs?\n\nAll scores and saved actions (bookmarks, notes, apply status) will also be removed.\n\nThis cannot be undone.`,
      )
    )
      return;

    try {
      const res = await jobApi.clearAll();
      setJobScraping({ jobs: [], scores: {} });
      setHiddenIds(new Set());

      const parts: string[] = [`${res.deleted} jobs`];
      if (res.scores_deleted) parts.push(`${res.scores_deleted} scores`);
      if (res.actions_deleted) parts.push(`${res.actions_deleted} actions`);
      toast.success(`Cleared ${parts.join(" · ")}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear jobs");
    }
  }

  async function onScore() {
    if (!profileId) {
      toast.error("Please set up your profile first.");
      return;
    }

    setScoring(true);
    setJobScraping({
      scoringInProgress: true,
      scoringStartedAt: Date.now(),
    });

    const startTime = Date.now();

    try {
      const results = await api.calcScore({ profile_id: profileId });

      const map: Record<string, number> = {};
      results.forEach((r) => {
        if (r.total_score != null) map[r.job_id] = r.total_score;
      });

      setJobScraping({
        scores: map,
        scoringInProgress: false,
        scoringStartedAt: undefined,
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed));
      }

      const scoreValues = Object.values(map);
      const topScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;

      if (topScore >= 80) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success(`🎉 Your top match: ${Math.round(topScore)}%!`);
      } else {
        toast.success(`Scored ${results.length} jobs`);
      }
    } catch (e) {
      console.error(e);
      setJobScraping({ scoringInProgress: false, scoringStartedAt: undefined });
      toast.error("Scoring failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setScoring(false);
    }
  }

  async function onScrape() {
    if (!keywords.trim()) {
      toast.error("Please enter a keyword to search.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.scrapeJobs({
        keywords,
        location_search: location || undefined,
        page_to_scrape: page,
        filter_level: levels.length > 0 ? levels.join(",") : undefined,
      });
      setJobScraping({ jobs: data, scores: {} });
      toast.success(`Scraped ${data.length} jobs from ${source}.`);
    } catch (e) {
      console.error(e);
      toast.error("Scrape failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          Job Scraping
        </CardTitle>
        <CardDescription>
          Collect open positions from job boards and score them against your
          profile.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {!profile ? (
          <EmptyState
            icon={<UserIcon className="size-6" />}
            title="Set up your profile first"
            description="Upload your CV to unlock AI job matching."
            action={{ label: "Set up profile", href: "/dashboard/my-profile" }}
          />
        ) : (
          <>
            {/* Form */}
            <fieldset
              disabled={loading || scoring}
              className="flex flex-col gap-5 disabled:pointer-events-none disabled:opacity-60"
            >
              <Field>
                <FieldLabel htmlFor="source">Source</FieldLabel>
                <Select
                  value={source}
                  onValueChange={(v) => v && setSource(v as Source)}
                  disabled={loading || scoring}
                >
                  <SelectTrigger id="source" className="w-full">
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="size-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        disabled={s.disabled}
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  More sources (Glassdoor, Indeed) will be added later.
                </FieldDescription>
              </Field>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="keywords">Keywords</FieldLabel>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="keywords"
                      placeholder="e.g. Senior Backend Engineer, Go, Kubernetes"
                      className="pl-9"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Vietnam, Remote, Singapore…"
                      className="pl-9"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Experience level</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((l) => {
                        const active = levels.includes(l.value);
                        return (
                          <button
                            key={l.value}
                            type="button"
                            onClick={() => toggleLevel(l.value)}
                            disabled={loading || scoring}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
                              "disabled:cursor-not-allowed disabled:opacity-60",
                            )}
                          >
                            {active && <Check className="size-3" />}
                            {l.label}
                          </button>
                        );
                      })}
                    </div>
                    <FieldDescription>
                      Leave empty for any level. Multiple selections allowed.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="page">Pages to scrape</FieldLabel>
                    <Input
                      id="page"
                      type="number"
                      min={1}
                      max={1}
                      disabled
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value) || 1)}
                    />
                    <FieldDescription>
                      Fixed at 1 page (~5 jobs) to respect LinkedIn rate limits.
                    </FieldDescription>
                  </Field>
                </div>
              </FieldGroup>
            </fieldset>

            {/* Actions */}
            <Button
              onClick={onScrape}
              disabled={loading || scoring || !keywords.trim()}
              className="w-full"
            >
              {loading ? <Spinner /> : <Sparkles data-icon="inline-start" />}
              {loading
                ? "Scraping…"
                : scoring
                  ? "Scoring in progress…"
                  : "Start scraping"}
            </Button>

            {jobs.length > 0 && profileId && (
              <Button
                onClick={onScore}
                disabled={scoring || loading}
                variant="outline"
                className="w-full"
              >
                {scoring ? <Spinner /> : <Sparkles data-icon="inline-start" />}
                {scoring
                  ? `Scoring ${jobs.length} jobs…`
                  : `Score ${jobs.length} existing jobs`}
              </Button>
            )}

            {/* Results */}
            {jobs.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    Results{" "}
                    <span className="font-normal text-muted-foreground">
                      ({filtered.length}
                      {filtered.length !== jobs.length && ` / ${jobs.length}`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {source}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClearAll}
                      disabled={loading || scoring}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Hidden jobs banner */}
                {hiddenIds.size > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/[0.05] px-3 py-2 text-xs">
                    <span className="text-muted-foreground">
                      {hiddenIds.size} job{hiddenIds.size !== 1 ? "s" : ""}{" "}
                      hidden
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={unhideAll}
                    >
                      Show all
                    </Button>
                  </div>
                )}

                {/* Filter bar */}
                <JobFilterBar
                  jobs={jobs}
                  filter={filter}
                  onChange={setFilter}
                />

                {Object.keys(scores).length > 0 && (
                  <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/[0.06] to-transparent p-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-purple-500" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            Want deeper insights?
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            See radar chart, score distribution, and per-job AI
                            analysis.
                          </p>
                        </div>
                        <Link href="/dashboard/ai-analysis">
                          <Button size="sm" variant="outline">
                            Open AI Analysis →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[360px] rounded-xl border border-border bg-muted/20">
                  {filtered.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
                      No jobs match your filters.
                      <br />
                      Try clearing filters or scraping more jobs.
                    </div>
                  ) : (
                    <ul className="flex flex-col divide-y divide-border">
                      {filtered.map((job) => {
                        const score = scores[job.job_id];
                        return (
                          <li
                            key={job.job_id}
                            className="flex flex-col gap-1 p-3 transition-colors hover:bg-muted/40"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium">
                                  {job.title ?? "Untitled role"}
                                </span>
                                {score != null && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "shrink-0 font-mono text-xs",
                                      score >= 80 &&
                                        "bg-emerald-500/15 text-emerald-500",
                                      score >= 60 &&
                                        score < 80 &&
                                        "bg-amber-500/15 text-amber-500",
                                      score < 60 &&
                                        "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <CountUp
                                      end={Math.round(score)}
                                      duration={1.2}
                                    />
                                  </Badge>
                                )}
                              </div>

                              {job.job_url && (
                                <a
                                  href={job.job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open job"
                                  className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ExternalLink className="size-4" />
                                </a>
                              )}
                            </div>

                            {job.description && (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {job.description}
                              </p>
                            )}

                            {/* Job actions row */}
                            <div className="mt-2 flex items-center justify-end">
                              <JobActions
                                jobId={job.job_id}
                                onHide={(id) =>
                                  setHiddenIds((prev) => new Set(prev).add(id))
                                }
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </ScrollArea>
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                No jobs yet. Enter keywords and start scraping.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
