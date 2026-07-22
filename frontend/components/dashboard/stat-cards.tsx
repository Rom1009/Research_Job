"use client";

import { useEffect, useState } from "react";
import { Users, Target, TrendingUp, Briefcase } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type CandidateProfile, type MatchResult } from "@/lib/api";

export function StatCards() {
  const [users, setUsers] = useState<CandidateProfile[]>([]);
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.listUsers(), api.listScores()])
      .then(([u, s]) => {
        if (cancelled) return;
        setUsers(u);
        setScores(s);
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const totalProfiles = users.length;

  // Best score per profile
  const bestByProfile = new Map<string, number>();
  for (const s of scores) {
    const cur = bestByProfile.get(s.profile_id) ?? 0;
    bestByProfile.set(s.profile_id, Math.max(cur, s.total_score ?? 0));
  }

  const qualified = Array.from(bestByProfile.values()).filter(
    (v) => v >= 70,
  ).length;

  const avgAllScores =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + (s.total_score ?? 0), 0) /
            scores.length,
        )
      : 0;

  const totalMatches = scores.length;

  // Profiles ingested trong 7 ngày gần nhất
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentProfiles = users.filter(
    (u) => u.created_at && new Date(u.created_at).getTime() >= oneWeekAgo,
  ).length;

  const stats = [
    {
      label: "Profiles researched",
      value: String(totalProfiles),
      delta:
        recentProfiles > 0
          ? `+${recentProfiles} this week`
          : "no new this week",
      icon: Users,
    },
    {
      label: "Qualified (>70)",
      value: String(qualified),
      delta:
        totalProfiles > 0
          ? `${Math.round((qualified / totalProfiles) * 100)}% of pool`
          : "—",
      icon: Target,
    },
    {
      label: "Average AI score",
      value: String(avgAllScores),
      delta:
        totalMatches > 0
          ? `across ${totalMatches} match${totalMatches === 1 ? "" : "es"}`
          : "no scores yet",
      icon: TrendingUp,
    },
    {
      label: "Jobs scored",
      value: String(totalMatches),
      delta:
        totalProfiles > 0
          ? `~${Math.round(totalMatches / Math.max(totalProfiles, 1))} per profile`
          : "—",
      icon: Briefcase,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-start justify-between gap-3 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="font-mono text-3xl font-semibold tabular-nums">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.delta}</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <s.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
