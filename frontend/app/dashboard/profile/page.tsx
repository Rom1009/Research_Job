"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Lock,
  FileText,
  Star,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { api, authApi, jobApi } from "@/lib/api";
import type { CandidateProfile, MatchResult } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/dashboard/brand-icons";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [scores, setScores] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listUsers(), api.listScores()])
      .then(([p, s]) => {
        setProfiles(p);
        setScores(s);
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="border-b bg-gradient-to-br from-primary/[0.06] to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-xl font-bold text-primary-foreground shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {user?.role ?? "user"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="scores">Scored Jobs</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* ─── Account ─── */}
          <TabsContent value="account" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="size-4" />
                  Account details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row
                  icon={<UserIcon className="size-4" />}
                  label="Name"
                  value={user?.name ?? "—"}
                />
                <Row
                  icon={<Mail className="size-4" />}
                  label="Email"
                  value={user?.email ?? "—"}
                />
                <Row
                  icon={<Star className="size-4" />}
                  label="Role"
                  value={user?.role ?? "user"}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Candidates (CV + GitHub) ─── */}
          <TabsContent value="candidates" className="mt-4 space-y-3">
            {loading ? (
              <SpinnerBox />
            ) : profiles.length === 0 ? (
              <EmptyBox text="No candidates uploaded yet." />
            ) : (
              profiles.map((p) => (
                <Card key={p.candidate_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Candidate {p.candidate_id.slice(0, 8)}…
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {p.created_at &&
                        `Uploaded ${new Date(p.created_at).toLocaleString()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {p.cv_url && (
                        <a href={p.cv_url} target="_blank" rel="noreferrer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                          >
                            <FileText className="size-3.5" /> View CV
                          </Button>
                        </a>
                      )}
                      {p.github_url && (
                        <a href={p.github_url} target="_blank" rel="noreferrer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                          >
                            <GithubIcon className="size-3.5" /> GitHub
                          </Button>
                        </a>
                      )}
                    </div>
                    {p.cv_structured?.skills &&
                      p.cv_structured.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.cv_structured.skills.slice(0, 12).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                          {p.cv_structured.skills.length > 12 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{p.cv_structured.skills.length - 12} more
                            </Badge>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ─── Scored jobs ─── */}
          <TabsContent value="scores" className="mt-4 space-y-2">
            {loading ? (
              <SpinnerBox />
            ) : scores.length === 0 ? (
              <EmptyBox text="No scored jobs yet. Score jobs in Job Scraping page." />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="size-4 text-amber-500" />
                    All scored jobs ({scores.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {scores
                      .sort(
                        (a, b) => (b.total_score ?? 0) - (a.total_score ?? 0),
                      )
                      .map((s) => (
                        <li
                          key={s.match_id}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {s.job_title ?? "Untitled"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {s.job_company} · {s.job_location}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "font-mono",
                              (s.total_score ?? 0) >= 80 &&
                                "bg-emerald-500/15 text-emerald-500",
                              (s.total_score ?? 0) >= 60 &&
                                (s.total_score ?? 0) < 80 &&
                                "bg-amber-500/15 text-amber-500",
                              (s.total_score ?? 0) < 60 &&
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {Math.round(s.total_score ?? 0)}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Change password ─── */}
          <TabsContent value="password" className="mt-4">
            <ChangePasswordCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-20 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="ml-2 text-sm">{value}</span>
    </div>
  );
}

function SpinnerBox() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed p-8 text-muted-foreground">
      <Spinner />
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.changePassword?.(current, next); // ⚠ cần thêm endpoint
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      toast.error("Failed to change password", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="size-4" /> Change password
        </CardTitle>
        <CardDescription>
          Use a strong password you don't use elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field>
            <FieldLabel>Current password</FieldLabel>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>New password</FieldLabel>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={6}
            />
          </Field>
          <Field>
            <FieldLabel>Confirm new password</FieldLabel>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
