"use client";


import {
  UploadCloud,
  Sparkles,
  Search,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ProfileIntake } from "@/components/dashboard/profile-intake";
import { Card, CardContent } from "@/components/ui/card";


export default function ProfileIntakePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            NEW CANDIDATE PROFILE
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Onboard a candidate
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload a resume PDF and connect a GitHub profile. Our system parses
            skills, education, projects, and matches them against your live job
            pool.
          </p>
        </div>
      </div>


      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.15fr]">
          {/* ── LEFT: how it works + trust signals ── */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                How it works
              </h2>
              <ol className="space-y-4">
                <StepItem
                  n={1}
                  icon={UploadCloud}
                  title="Upload the CV"
                  desc="PDF only, up to 10MB. We parse it into structured data."
                />
                <StepItem
                  n={2}
                  icon={Search}
                  title="Add a GitHub profile"
                  desc="Optional but recommended — enriches skill signals with real project evidence."
                />
                <StepItem
                  n={3}
                  icon={Sparkles}
                  title="AI extracts everything"
                  desc="Skills, education, work history, achievements — normalized and stored."
                />
                <StepItem
                  n={4}
                  icon={CheckCircle2}
                  title="Match against jobs"
                  desc="One click to score this candidate against every job in your pool."
                />
              </ol>
            </div>


            {/* Trust signals */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TrustCard
                icon={Shield}
                title="Private by default"
                desc="Files stored per workspace, not shared."
              />
              <TrustCard
                icon={Clock}
                title="~10s per profile"
                desc="Parsing + matching happens in seconds."
              />
            </div>
          </div>


          {/* ── RIGHT: the form ── */}
          <div>
            <ProfileIntake />
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
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
          {n}
        </div>
        {n < 4 && (
          <div className="mt-1 h-6 w-px bg-gradient-to-b from-primary/30 to-transparent" />
        )}
      </div>
      <div className="pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-3.5 text-primary/70" />
          {title}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}


function TrustCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-border/60 bg-muted/20">
      <CardContent className="flex items-start gap-3 p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}



