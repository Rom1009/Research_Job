"use client";

import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  Zap,
  Target,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { LinkedinIcon } from "@/components/dashboard/brand-icons"; // ✅
import { JobScraping } from "@/components/dashboard/job-scraping";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStore } from "@/lib/dashboard-store";
import { useMyProfile } from "@/hooks/use-my-profile";

export default function JobsPage() {
  const { profile } = useMyProfile();
  const activeProfileId = profile?.candidate_id;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
            <LinkedinIcon className="size-3.5" />
            JOB DISCOVERY
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Find your next role
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Collect open positions from LinkedIn and build a live job pool.
            Every scraped role becomes eligible for AI matching against your
            candidates.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* No profile warning */}
        {!activeProfileId && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">Upload your CV first</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You can still scrape jobs, but scoring requires an active
                profile.{" "}
                <Link
                  href="/dashboard/my-profile"
                  className="font-medium text-primary underline"
                >
                  Set up your profile →
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(340px,420px)_1fr]">
          {/* ── LEFT: tips + sources ── */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* How it works */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                How scraping works
              </h2>
              <ol className="space-y-4">
                <StepItem
                  n={1}
                  icon={Filter}
                  title="Set your filters"
                  desc="Keywords, location, experience level. Narrower = better matches."
                />
                <StepItem
                  n={2}
                  icon={Search}
                  title="Scrape the source"
                  desc="We pull job cards + descriptions in the background. ~25 jobs per page."
                />
                <StepItem
                  n={3}
                  icon={Sparkles}
                  title="See your match score"
                  desc="Every new job is scored vs. your active profile automatically."
                />
              </ol>
            </div>

            {/* Tips */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <BookOpen className="size-4" />
                  Tips for better results
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <TipItem>
                    Use{" "}
                    <span className="font-mono text-foreground">
                      specific tech
                    </span>{" "}
                    keywords (e.g. "PyTorch", "Kubernetes") over generic titles.
                  </TipItem>
                  <TipItem>
                    Combine keywords with{" "}
                    <span className="font-mono text-foreground">OR</span> for
                    broader results:{" "}
                    <span className="font-mono text-foreground">
                      "ML OR AI OR Data"
                    </span>
                    .
                  </TipItem>
                  <TipItem>
                    Leave location empty for remote-inclusive results.
                  </TipItem>
                  <TipItem>
                    Start with{" "}
                    <span className="font-mono text-foreground">1 page</span> to
                    test filters before scraping more.
                  </TipItem>
                </ul>
              </CardContent>
            </Card>

            {/* Sources status */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Sources
              </h2>
              <div className="space-y-2">
                <SourceRow name="LinkedIn" status="live" />
                <SourceRow name="Glassdoor" status="soon" />
                <SourceRow name="Indeed" status="soon" />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                icon={Zap}
                label="Avg per page"
                value="~25"
                tone="text-blue-500"
              />
              <MiniStat
                icon={Target}
                label="Scrape time"
                value="~30s"
                tone="text-emerald-500"
              />
            </div>
          </div>

          {/* ── RIGHT: the form ── */}
          <div>
            <JobScraping />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────── SUB-COMPONENTS ───────────────────

function StepItem({
  n,
  icon: Icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-500">
          {n}
        </div>
        {n < 3 && (
          <div className="mt-1 h-6 w-px bg-gradient-to-b from-blue-500/30 to-transparent" />
        )}
      </div>
      <div className="pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-3.5 text-blue-500/70" />
          {title}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function TipItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5 leading-relaxed">
      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

function SourceRow({
  name,
  status,
}: {
  name: string;
  status: "live" | "soon";
}) {
  const live = status === "live";
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <span className="text-sm font-medium">{name}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          live
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${
            live ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"
          }`}
        />
        {live ? "Live" : "Soon"}
      </span>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-muted ${tone}`}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-mono text-sm font-bold ${tone}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
