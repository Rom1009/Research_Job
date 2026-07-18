"use client";


import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api, type UserProfile } from "@/lib/api";


interface DashboardCandidateListProps {
  onSelectCandidate: (user: UserProfile) => void;
  selectedCandidateId?: string;
}


function handleFromUrl(url?: string): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, "").split("/")[0] || u.hostname;
  } catch {
    return url;
  }
}


export function DashboardCandidateList({
  onSelectCandidate,
  selectedCandidateId,
}: DashboardCandidateListProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    let cancelled = false;
    api
      .listUsers()
      .then((data) => !cancelled && setUsers(data))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);


  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const handle = handleFromUrl(u.github_url).toLowerCase();
    const skills = (u.cv_structured?.skills ?? []).map((s) => s.toLowerCase());
    return handle.includes(q) || skills.some((s) => s.includes(q));
  });


  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
        <CardDescription>
          Click a candidate to view details in the right panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by github or skill…"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {users.length === 0 ? "No candidates yet." : "No matches."}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((u) => {
                const handle = handleFromUrl(u.github_url);
                const skills = u.cv_structured?.skills ?? [];
                const isSelected = u.user_id === selectedCandidateId;
                return (
                  <li key={u.user_id}>
                    <button
                      onClick={() => onSelectCandidate(u)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {handle}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {u.user_id.slice(0, 8)}…
                          </p>
                        </div>
                        {u.created_at && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skills.slice(0, 4).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                          {skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

