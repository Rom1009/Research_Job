"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, type CandidateProfile } from "@/lib/api";
import { CandidateDetailPanel } from "@/components/dashboard/candidate-detail-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setLoading(true);
    api
      .listUsers()
      .then((list) => {
        const found = list.find((c) => c.candidate_id === id);
        if (!found) setError("Candidate not found");
        else setCandidate(found);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="size-4" />
            Back to candidates
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {candidate && (
        <CandidateDetailPanel
          candidate={candidate}
          onClose={() => router.push("/dashboard/candidates")}
        />
      )}
    </div>
  );
}
