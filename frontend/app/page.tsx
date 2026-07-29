"use client";


import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Target,
  ClipboardCheck,
  ArrowRight,
  Zap,
  Code2,
  MessageSquareCode,
} from "lucide-react";


export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);


  // Loading or redirecting authenticated user
  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Nav ─── */}
      <nav className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold">DevJobCopilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>


      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs">
          <Zap className="size-3" />
          <span>Built for developers, by a developer</span>
        </div>


        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Your AI Career Copilot for{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            dev jobs
          </span>
        </h1>


        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Show your code, not just your CV. Upload your resume + GitHub, and let AI
          match you with dev jobs, analyze gaps, and prep you for interviews.
        </p>


        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              I already have an account
            </Button>
          </Link>
        </div>


        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Takes ~30 seconds to set up
        </p>
      </section>


      {/* ─── Features ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-16 text-center text-3xl font-bold">
          How DevJobCopilot works
        </h2>


        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Code2 className="size-6" />}
            step="01"
            title="Build your dev profile"
            desc="Upload your CV (PDF) and connect GitHub. AI extracts your skills, projects, and code activity into a complete dev strength profile."
          />
          <FeatureCard
            icon={<Target className="size-6" />}
            step="02"
            title="Find matching jobs"
            desc="Search LinkedIn (more sources coming). AI scores every job vs. your profile with skill match, gap analysis, and improvement tips."
          />
          <FeatureCard
            icon={<ClipboardCheck className="size-6" />}
            step="03"
            title="Track your search"
            desc="Save jobs, mark applied/interviewed/offered, take notes. See your progress across every application in one place."
          />
        </div>
      </section>


      {/* ─── Why different ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-10 md:p-14">
          <h2 className="mb-4 text-3xl font-bold">Why devs love it</h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Generic career tools treat you like a resume. DevJobCopilot reads your
            actual code.
          </p>


          <div className="grid gap-6 md:grid-cols-2">
            <Perk
              icon={<Code2 className="size-5" />}
              title="GitHub-aware scoring"
              desc="Match scores factor in your real projects and tech stack — not just resume keywords."
            />
            <Perk
              icon={<MessageSquareCode className="size-5" />}
              title="Actionable AI feedback"
              desc="For every mismatch, get concrete advice: skills to learn, projects to build, ways to reframe your experience."
            />
            <Perk
              icon={<Zap className="size-5" />}
              title="Fast, structured LLM"
              desc="Powered by Groq — sub-second scoring on Llama-3.3 with schema-validated JSON output."
            />
            <Perk
              icon={<Sparkles className="size-5" />}
              title="Free & open"
              desc="Currently free while in beta. Built to be portable — your data, your CV, your control."
            />
          </div>
        </div>
      </section>


      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold">Ready to find your next dev job?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Sign up in 30 seconds. Upload your CV, connect GitHub, and get matched
          with jobs that actually fit your code.
        </p>
        <Link href="/register" className="mt-8 inline-block">
          <Button size="lg" className="gap-2">
            Get started free
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>


      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <span>DevJobCopilot</span>
            <span>·</span>
            <span>Built by Thomas Nguyễn</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/Research_Job"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ─── Sub-components ───


function FeatureCard({
  icon,
  step,
  title,
  desc,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-border">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-xs font-mono text-muted-foreground">{step}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}


function Perk({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <h4 className="mb-1 font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

