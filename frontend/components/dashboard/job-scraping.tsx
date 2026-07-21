"use client";


import * as React from "react";
import { useState } from "react";
import {
  Check,
  Search,
  MapPin,
  Sparkles,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
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
import { api, type JobResponse } from "@/lib/api";
import { useDashboardStore } from "@/lib/dashboard-store";


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
  const [source, setSource] = useState<Source>("linkedin");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const activeProfileId = useDashboardStore((s) => s.activeProfileId);


  const [scores, setScores] = useState<Record<string, number>>({});
  const [scoring, setScoring] = useState(false);


  function toggleLevel(v: string) {
    setLevels((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  }


  async function onScore() {
    if (!activeProfileId) {
      toast.error("Upload a CV first — no active profile.");
      return;
    }
    setScoring(true);
    try {
      const results = await api.calcScore({ profile_id: activeProfileId });
      const map: Record<string, number> = {};
      results.forEach((r) => {
        if (r.total_score != null) map[r.job_id] = r.total_score;
      });
      setScores(map);
      toast.success(`Scored ${results.length} jobs.`);
    } catch (e) {
      console.error(e);
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
      setJobs(data);
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
          Collect open positions from job boards to match against candidate
          profiles.
        </CardDescription>
      </CardHeader>


      <CardContent className="flex flex-col gap-5">
        {/* ═══════ Form (khoá khi đang scrape) ═══════ */}
        <fieldset
          disabled={loading}
          className="flex flex-col gap-5 disabled:pointer-events-none disabled:opacity-60"
        >
          {/* Source */}
          <Field>
            <FieldLabel htmlFor="source">Source</FieldLabel>
            <Select
              value={source}
              onValueChange={(v) => v && setSource(v as Source)}
              disabled={loading}
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
            {/* Keywords */}
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


            {/* Location */}
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


            {/* Filters grid */}
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
                        disabled={loading}
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
                  max={10}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value) || 1)}
                />
              </Field>
            </div>
          </FieldGroup>
        </fieldset>


        {/* ═══════ Action ═══════ */}
        <Button
          onClick={onScrape}
          disabled={loading || !keywords.trim()}
          className="w-full"
        >
          {loading ? <Spinner /> : <Sparkles data-icon="inline-start" />}
          {loading ? "Scraping…" : "Start scraping"}
        </Button>


        {/* ═══════ Results ═══════ */}
        {jobs.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">
                Results{" "}
                <span className="font-normal text-muted-foreground">
                  ({jobs.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeProfileId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onScore}
                    disabled={scoring}
                  >
                    {scoring ? (
                      <Spinner />
                    ) : (
                      <Sparkles data-icon="inline-start" />
                    )}
                    {scoring ? "Scoring…" : "Start scoring"}
                  </Button>
                )}
                <Badge variant="secondary" className="capitalize">
                  {source}
                </Badge>
              </div>
            </div>


            <ScrollArea className="h-[360px] rounded-xl border border-border bg-muted/20">
              <ul className="flex flex-col divide-y divide-border">
                {jobs.map((job) => (
                  <li
                    key={job.job_id}
                    className="flex flex-col gap-1 p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {job.title ?? "Untitled role"}
                        </span>
                        {scores[job.job_id] != null && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "shrink-0 font-mono text-xs",
                              scores[job.job_id] >= 80 &&
                                "bg-emerald-500/15 text-emerald-500",
                              scores[job.job_id] >= 60 &&
                                scores[job.job_id] < 80 &&
                                "bg-amber-500/15 text-amber-500",
                              scores[job.job_id] < 60 &&
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {Math.round(scores[job.job_id])}
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
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}


        {jobs.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
            No jobs yet. Enter keywords and start scraping.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

