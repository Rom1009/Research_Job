"use client"

import * as React from "react"
import { FileText, UploadCloud, X, Check, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { GithubIcon, LinkedinIcon } from "@/components/dashboard/brand-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

const STAGES = [
  "Uploading resume",
  "Connecting to LinkedIn",
  "Scraping profile & activity",
  "Analyzing Git contributions",
  "Running AI scoring",
] as const

export function ProfileIntake() {
  const [file, setFile] = React.useState<File | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [gitUrl, setGitUrl] = React.useState("")
  const [linkedinUrl, setLinkedinUrl] = React.useState("")
  const [stage, setStage] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const scraping = stage >= 0 && stage < STAGES.length
  const progress = stage < 0 ? 0 : Math.round(((stage + 1) / STAGES.length) * 100)

  React.useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  function handleFiles(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF resume.")
      return
    }
    setFile(f)
  }

  function startResearch() {
    if (!file && !linkedinUrl && !gitUrl) {
      toast.error("Add a resume, LinkedIn, or Git link to start.")
      return
    }
    timers.current.forEach(clearTimeout)
    timers.current = []
    setStage(0)
    STAGES.forEach((_, i) => {
      const t = setTimeout(
        () => {
          if (i === STAGES.length - 1) {
            setStage(STAGES.length)
            setTimeout(() => setStage(-1), 900)
            toast.success("Candidate researched and scored.", {
              description: "New profile added to the pipeline.",
            })
          } else {
            setStage(i + 1)
          }
        },
        (i + 1) * 1100,
      )
      timers.current.push(t)
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Profile Intake</CardTitle>
        <CardDescription>
          Upload a resume and connect social profiles to run automated research.
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
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
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
          <div className="text-xs text-muted-foreground">
            PDF up to 10MB
          </div>
        </div>

        {file ? (
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
        ) : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="linkedin-url">LinkedIn profile</FieldLabel>
            <div className="relative">
              <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="linkedin-url"
                placeholder="linkedin.com/in/username"
                className="pl-9"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </Field>
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

        {scraping ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Spinner className="text-primary" />
              <span className="text-sm font-medium">
                {STAGES[stage]}…
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
                {progress}%
              </span>
            </div>
            <Progress value={progress} />
            <ul className="mt-3 flex flex-col gap-1.5">
              {STAGES.map((label, i) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    i < stage
                      ? "text-foreground"
                      : i === stage
                        ? "text-primary"
                        : "text-muted-foreground",
                  )}
                >
                  {i < stage ? (
                    <Check className="size-3.5 text-chart-3" />
                  ) : i === stage ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span className="size-3.5 rounded-full border border-border" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Button onClick={startResearch} className="w-full">
            <Sparkles data-icon="inline-start" />
            Start research
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
