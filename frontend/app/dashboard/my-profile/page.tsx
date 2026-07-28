"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CandidateProfile } from "@/lib/api";
import { useMyProfile } from "@/hooks/use-my-profile";
import { CandidateDetailPanel } from "@/components/dashboard/candidate-detail-panel";
import { ProfileIntake } from "@/components/dashboard/profile-intake";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/dashboard/brand-icons";
import { UploadCloud, X, Save } from "lucide-react";

export default function MyProfilePage() {
  const { profile, loading, refresh } = useMyProfile();
  const [editMode, setEditMode] = useState<"none" | "full" | "github">("none");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ─── Chưa có profile → show intake form ───
  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Set up your profile</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Upload your CV and connect GitHub — we'll extract skills
          automatically.
        </p>
        <ProfileIntake onSuccess={() => refresh()} />
      </div>
    );
  }

  // ─── Full re-upload mode ───
  if (editMode === "full") {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Update your profile</h1>
          <Button variant="ghost" onClick={() => setEditMode("none")}>
            <X className="mr-1 size-4" /> Cancel
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Uploading a new CV will re-parse your skills and clear old match
          scores.
        </p>
        <ProfileIntake
          initialGithubUrl={profile.github_url}
          onSuccess={async () => {
            await refresh();
            setEditMode("none");
          }}
        />
      </div>
    );
  }

  // ─── View + inline edit buttons ───
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditMode("github")}
            className="gap-1.5"
          >
            <GithubIcon className="size-4" /> Update GitHub
          </Button>
          <Button onClick={() => setEditMode("full")} className="gap-1.5">
            <UploadCloud className="size-4" /> Update CV
          </Button>
        </div>
      </div>

      {editMode === "github" && (
        <UpdateGithubCard
          profile={profile}
          onDone={async () => {
            await refresh();
            setEditMode("none");
          }}
          onCancel={() => setEditMode("none")}
        />
      )}

      <CandidateDetailPanel candidate={profile} onClose={() => {}} />
    </div>
  );
}

/* ─────────── Inline: update GitHub only ─────────── */
function UpdateGithubCard({
  profile,
  onDone,
  onCancel,
}: {
  profile: CandidateProfile;
  onDone: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState(profile.github_url ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!url.trim()) {
      toast.error("Please enter a GitHub URL");
      return;
    }
    setSaving(true);
    try {
      await api.updateGithub(profile.candidate_id, url.trim());
      toast.success("GitHub updated — re-analyzing…");
      await onDone();
    } catch (e) {
      toast.error("Update failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GithubIcon className="size-4" /> Update GitHub profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field>
          <FieldLabel>GitHub URL</FieldLabel>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/your-handle"
            disabled={saving}
          />
        </Field>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Spinner /> : <Save className="size-4" />}
            Save
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
