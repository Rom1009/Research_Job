"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Building2,
} from "lucide-react";
import { api, type MatchResult } from "@/lib/api";
import { useMyProfile } from "@/hooks/use-my-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { normalizeSkills } from "@/lib/utils";
import { AnimatedCard } from "@/components/animated-page";


export function Overview() {
  const { profile } = useMyProfile();
  const [scores, setScores] = useState<MatchResult[]>([]);


  useEffect(() => {
    if (!profile) return;
    api
      .getUserScores(profile.candidate_id)
      .then(setScores)
      .catch(() => {});
  }, [profile]);


  const sorted = useMemo(
    () =>
      [...scores].sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0)),
    [scores],
  );


  const topScore = sorted[0]?.total_score ?? 0;
  const avgScore = scores.length
    ? Math.round(
        scores.reduce((s, m) => s + (m.total_score ?? 0), 0) / scores.length,
      )
    : 0;


  if (!profile) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col items-center p-12 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-3xl shadow-xl">
            ✨
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Welcome to your Career Copilot
          </h1>
          <p className="mb-8 text-muted-foreground">
            Upload your CV and connect GitHub — we'll analyze your skills, match
            you with real jobs, and tell you exactly what to improve.
          </p>


          <div className="mb-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            <StepBox n="1" icon="📄" title="Upload CV" desc="PDF, up to 10MB" />
            <StepBox
              n="2"
              icon="🐙"
              title="Add GitHub"
              desc="Optional but recommended"
            />
            <StepBox
              n="3"
              icon="🎯"
              title="Find matches"
              desc="AI scores every job"
            />
          </div>


          <Link href="/dashboard/my-profile">
            <Button size="lg" className="gap-2">
              Set up your profile <ArrowRight className="size-4" />
            </Button>
          </Link>


          <p className="mt-4 text-xs text-muted-foreground">
            Takes about 30 seconds
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground">
            Here's how your job search is going.
          </p>
        </div>


        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            icon={<Target />}
            label="Jobs scored"
            value={scores.length}
          />
          <StatCard
            icon={<TrendingUp />}
            label="Average match"
            value={`${avgScore}%`}
          />
          <StatCard
            icon={<Sparkles />}
            label="Top match"
            value={`${Math.round(topScore)}%`}
          />
        </div>


        {sorted.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                🎯 Your top matches
              </h2>
              <Link
                href="/dashboard/ai-analysis"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all {scores.length} →
              </Link>
            </div>


            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {sorted.slice(0, 3).map((match, idx) => (
                <AnimatedCard key={match.match_id} delay={idx * 0.1}>
                  <TopMatchCard match={match} rank={idx + 1} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ────────── Sub-components ────────── */


function StepBox({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1 text-xs text-muted-foreground">STEP {n}</div>
      <div className="mb-1 text-xl">{icon}</div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}


function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-2 text-primary">
          {icon} <span className="text-xs uppercase">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}


function TopMatchCard({ match, rank }: { match: MatchResult; rank: number }) {
  const score = Math.round(match.total_score ?? 0);
  const scoreColor =
    score >= 80
      ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
      : score >= 60
        ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
        : "border-border text-muted-foreground bg-muted/30";
  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";


  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/20 to-transparent p-5 transition-all hover:border-primary/40 hover:shadow-lg">
      {/* Rank medal */}
      <div className="absolute right-4 top-4 text-2xl">{rankEmoji}</div>


      {/* Score badge */}
      <div className="mb-3">
        <div
          className={`inline-flex items-baseline gap-1 rounded-lg border-2 px-3 py-1 shadow-sm ${scoreColor}`}
        >
          <span className="font-mono text-2xl font-bold tabular-nums">
            {score}
          </span>
          <span className="text-[10px] font-medium uppercase opacity-70">
            match
          </span>
        </div>
      </div>


      {/* Title + company */}
      <h3 className="mb-1 line-clamp-2 pr-10 text-base font-bold leading-tight">
        {match.job_title || "Untitled"}
      </h3>
      <p className="mb-3 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <Building2 className="size-3" />
        <span className="truncate">{match.job_company || "—"}</span>
        {match.job_location && (
          <>
            <span>·</span>
            <span className="truncate">{match.job_location}</span>
          </>
        )}
      </p>


      {/* Evaluation preview */}
      {match.ai_analysis_details?.evaluation_summary && (
        <p className="mb-3 line-clamp-3 text-xs italic leading-relaxed text-foreground/70">
          "{match.ai_analysis_details.evaluation_summary}"
        </p>
      )}


      {/* Matched skills */}
      {!!match.ai_analysis_details?.matched_skills?.length &&
        (() => {
          const skills = normalizeSkills(
            match.ai_analysis_details.matched_skills,
          );
          return (
            <div className="mb-4 flex min-w-0 flex-wrap gap-1">
              {skills.slice(0, 4).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  title={s}
                  className="max-w-full truncate border-emerald-500/30 bg-emerald-500/5 text-[10px] text-emerald-700 dark:text-emerald-400"
                >
                  {s}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          );
        })()}


      {/* Action */}
      <div className="mt-auto">
        {match.job_url ? (
          <a
            href={match.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="sm" className="w-full gap-1.5">
              <ExternalLink className="size-3.5" />
              View job
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            No link available
          </Button>
        )}
      </div>
    </div>
  );
}



