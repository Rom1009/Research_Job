"use client";


import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud, X, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { GithubIcon } from "@/components/dashboard/brand-icons";
import { useDashboardStore } from "@/lib/dashboard-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";


export function ProfileIntake() {
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const setActiveProfileId = useDashboardStore((s) => s.setActiveProfileId);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [gitUrl, setGitUrl] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>();


  async function handleSubmit(github: string, cv: string) {
    try {
      setLoading(true);
      const data = await api.submitUser({ github_url: github, cv_url: cv });
      setResult(data.user_id);
      toast.success("Profile saved.", {
        description: `User ID: ${data.user_id}`,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to process profile.", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }


  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF resume.");
      return;
    }
    setFile(f);
  }


  function onStart() {
    if (!gitUrl) {
      toast.error("Add a GitHub link to start.");
      return;
    }
    handleSubmit(gitUrl, "https://placeholder.local/cv.pdf");
  }


  function goFindJobs() {
    if (!result) return;
    setActiveProfileId(result); // lưu id vào store
    setActiveTab("jobs"); // chuyển sang tab Jobs
  }


  function reset() {
    setResult(undefined);
    setFile(null);
    setGitUrl("");
  }


  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Upload CV</CardTitle>
        <CardDescription>
          Upload a resume PDF and connect a GitHub profile to run automated
          research.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging && "border-primary bg-primary/10",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <UploadCloud className="size-5" />
          </div>
          <div className="text-sm font-medium">
            Drop resume PDF here or click to browse
          </div>
          <div className="text-xs text-muted-foreground">PDF up to 10MB</div>
        </div>


        {file && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <FileText className="size-4" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB · PDF
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove file"
              onClick={() => setFile(null)}
            >
              <X />
            </Button>
          </div>
        )}


        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="git-url">Git repository / profile</FieldLabel>
            <div className="relative">
              <GithubIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="git-url"
                placeholder="github.com/username"
                className="pl-9"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
              />
            </div>
            <FieldDescription>
              We analyze public commit history and language breakdown.
            </FieldDescription>
          </Field>
        </FieldGroup>


        <Button
          onClick={onStart}
          disabled={loading || (!file && !gitUrl)}
          className="w-full"
        >
          {loading ? <Spinner /> : <Sparkles data-icon="inline-start" />}
          {loading ? "Processing…" : "Start research"}
        </Button>


        {result && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                ✓
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">Profile saved</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {result}
                </span>
              </div>
            </div>


            <div className="flex gap-2">
              <Button onClick={goFindJobs} size="sm" className="flex-1">
                <Search data-icon="inline-start" />
                Find matching jobs
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                Add another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}